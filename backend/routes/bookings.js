	const express = require("express");
	const router = express.Router();
	const Booking = require("../models/Booking");
	const Guest = require("../models/Guest");
	const Room = require("../models/Room");

	const multer = require("multer");
	const { CloudinaryStorage } = require("multer-storage-cloudinary");
	const cloudinary = require("cloudinary").v2;

	/* ================= CLOUDINARY CONFIG ================= */
	cloudinary.config({
		cloud_name: process.env.CLOUD_NAME,
		api_key: process.env.API_KEY,
		api_secret: process.env.API_SECRET,
	});

	const storage = new CloudinaryStorage({
		cloudinary: cloudinary,
		params: {
			folder: "booking_docs",
			resource_type: "auto", // supports image/pdf
		},
	});

	const upload = multer({ storage });

	/* ================= GET ALL BOOKINGS ================= */
	router.get("/", async (req, res) => {
		try {
			console.log("📥 Fetching all bookings...");
			const bookings = await Booking.find().sort({ createdAt: -1 });
			res.json(bookings);
		} catch (err) {
			console.error("❌ GET BOOKINGS ERROR:", err);
			res.status(500).json({ error: err.message });
		}
	});

	/* ================= CREATE BOOKING ================= */
	router.post("/", upload.single("docFile"), async (req, res) => {
		try {
			console.log("📨 Incoming booking request");
			console.log("BODY:", req.body);

			const {
				name,
				contact,
				room,
				roomno,
				checkin,
				checkout,
				adult,
				child,
				members
			} = req.body;
			

			if (!name || !contact || !room || !checkin || !checkout) {
				return res.status(400).json({ message: "Missing required fields" });
			}

			/* ================= FIND ROOM ================= */
			const roomDoc = await Room.findOne({ title: room });
			if (!roomDoc) {
				return res.status(404).json({ message: "Room not found" });
			}

			/* ================= GET CONFLICT BOOKINGS ================= */
			const conflictingBookings = await Booking.find({
				room,
				checkin: { $lt: new Date(checkout) },
				checkout: { $gt: new Date(checkin) },
			});

			const bookedNumbers = conflictingBookings.map(b => Number(b.roomno));

			let finalRoomNo = roomno ? Number(roomno) : null;

			/* ================= AUTO ASSIGN ================= */
			if (!finalRoomNo) {
				const available = roomDoc.roomNumbers.find(
					num => !bookedNumbers.includes(num)
				);

				if (!available) {
					return res.status(400).json({
						message: "No rooms available for selected dates",
					});
				}

				finalRoomNo = available;
			}

			/* ================= DUPLICATE ROOM CHECK ================= */
			if (bookedNumbers.includes(finalRoomNo)) {
				return res.status(400).json({
					message: `Room ${finalRoomNo} is already booked`,
				});
			}

			/* ================= CREATE BOOKING ================= */


const totalPersons = Number(adult || 0) + Number(child || 0) || Number(req.body.noOfPersons || 1);
const newBooking = new Booking({
	name,
	contact,
	room,
	roomno: finalRoomNo,
	checkin,
	checkout,
	adult: adult ? Number(adult) : 0,
    child: child ? Number(child) : 0,
	noOfPersons: totalPersons,
	docFile: req.file?.path,
	docType: req.file?.mimetype,
});

			await newBooking.save();

			/* ================= UPDATE BOOKED COUNT ================= */
			const activeBookings = await Booking.countDocuments({
				room,
				checkout: { $gt: new Date() }
			});

			roomDoc.bookedRooms = activeBookings;
			await roomDoc.save();

			/* ================= SAVE MEMBERS ================= */
			if (members) {
				const parsedMembers = JSON.parse(members);

				for (const m of parsedMembers) {
					await Guest.create({
						bookerName: name,
						bookerContact: contact,
						memberName: m.name,
						memberContact: m.contact,
						memberAge: m.age,
						memberGender: m.gender,
						roomNo: finalRoomNo,
						checkin,
						checkout,
					});
				}
			}

			/* ================= ADD BOOKER ================= */
			await Guest.create({
				bookerName: name,
				bookerContact: contact,
				memberName: name,
				memberContact: contact,
				memberAge: 25,
				memberGender: "N/A",
				roomNo: finalRoomNo,
				checkin,
				checkout,
			});

			res.json({
				message: "Booking successful",
				booking: newBooking,
			});

		} catch (err) {
			console.error("🔥 BOOKING ERROR:", err);
			res.status(500).json({ error: err.message });
		}
	});

	/* ================= UPDATE BOOKING ================= */
	router.put("/:id", upload.single("docFile"), async (req, res) => {
		try {
			const booking = await Booking.findById(req.params.id);
			if (!booking) {
				return res.status(404).json({ message: "Booking not found" });
			}

			Object.assign(booking, req.body);

			if (req.file) {
				// delete old doc
				if (booking.docFile) {
					const publicId = booking.docFile.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy("booking_docs/" + publicId);
				}

				booking.docFile = req.file.path;
				booking.docType = req.file.mimetype;
			}

			await booking.save();
			res.json(booking);

		} catch (err) {
			console.error("❌ UPDATE BOOKING ERROR:", err);
			res.status(500).json({ error: err.message });
		}
	});

	/* ================= DELETE BOOKING ================= */
	router.delete("/:id", async (req, res) => {
		try {
			const booking = await Booking.findById(req.params.id);
			if (!booking) {
				return res.status(404).json({ message: "Booking not found" });
			}

			// delete document from Cloudinary
			if (booking.docFile) {
				const publicId = booking.docFile.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy("booking_docs/" + publicId);
			}

			await Guest.deleteMany({
				bookerName: booking.name,
				bookerContact: booking.contact,
			});

			await Booking.findByIdAndDelete(req.params.id);
			await Guest.deleteMany({ roomNo: booking.roomno });

			/* ================= RECALCULATE ================= */
			const roomDoc = await Room.findOne({ title: booking.room });
			if (roomDoc) {
				const activeBookings = await Booking.countDocuments({
					room: booking.room,
					checkout: { $gt: new Date() },
				});
				roomDoc.bookedRooms = activeBookings;
				await roomDoc.save();
			}

			res.json({ message: "Booking deleted" });

		} catch (err) {
			console.error("❌ DELETE BOOKING ERROR:", err);
			res.status(500).json({ error: err.message });
		}
	});

	/* ================= AVAILABILITY ================= */
	router.get("/availability/:date", async (req, res) => {
		try {
			const selectedDate = new Date(req.params.date);

			const bookings = await Booking.find({
				checkin: { $lte: selectedDate },
				checkout: { $gt: selectedDate },
				status: "Checked In"   // 🔥 ONLY THIS
			});

			const availability = {};
			bookings.forEach(b => {
				availability[b.room] = (availability[b.room] || 0) + 1;
			});

			const result = Object.keys(availability).map(room => ({
				room,
				count: availability[room],
			}));

			res.json(result);

		} catch (err) {
			res.status(500).json({ message: "Failed to fetch availability" });
		}
	});

	module.exports = router;