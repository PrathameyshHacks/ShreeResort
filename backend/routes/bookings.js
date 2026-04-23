//bookings.js
//bookings.js
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
			members,
			activities
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
		// ✅ Normalize dates (VERY IMPORTANT FIX)
		const checkInDate = new Date(checkin);
		checkInDate.setHours(0, 0, 0, 0);
		const checkOutDate = new Date(checkout);
		checkOutDate.setHours(0, 0, 0, 0);

		if (checkInDate.getTime() >= checkOutDate.getTime()) {
			return res.status(400).json({ message: "Check-out must be after check-in" });
		}

		// ✅ Correct conflict check
		const conflictingBookings = await Booking.find({
			room: roomDoc.title,
			$and: [
				{ checkin: { $lt: checkOutDate } },
				{ checkout: { $gt: checkInDate } }
			],
			status: { $ne: "Checked Out" } // 🔥 IMPORTANT FIX
		});

		// 🔍 Debug (optional but recommended)
		console.log("CHECKIN:", checkInDate);
		console.log("CHECKOUT:", checkOutDate);
		console.log("CONFLICTS:", conflictingBookings);

		const bookedNumbers = conflictingBookings
			.map(b => Number(b.roomno))
			.filter(n => !isNaN(n));

		let finalRoomNo = (roomno !== undefined && roomno !== null && roomno !== "") ? Number(roomno) : null;

		/* ================= AUTO ASSIGN ================= */
		if (finalRoomNo === null) {
			const available = roomDoc.roomNumbers.find(
				num => !bookedNumbers.includes(num)
			);

			if (available === undefined) {
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



		let parsedActivities = [];
		if (activities) {
			parsedActivities = JSON.parse(activities);
		}


		let activitiesTotal = 0;

		if (parsedActivities.length > 0) {
			activitiesTotal = parsedActivities.reduce((sum, a) => sum + a.price, 0);
		}

		const totalPersons = Number(adult || 0) + Number(child || 0) || Number(req.body.noOfPersons || 1);

		const newBooking = new Booking({
			name,
			contact,
			room,
			roomno: finalRoomNo,
			checkin,
			checkout,
			adult: Number(adult) || 0,
			child: Number(child) || 0,
			noOfPersons: totalPersons,
			docFile: req.file?.path,
			docType: req.file?.mimetype,
			activities: parsedActivities,
			totalActivities: activitiesTotal
		});
		await newBooking.save();

		/* ================= UPDATE BOOKED COUNT ================= */
		// (Dynamic availability now handles this, no longer saving manually)

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

		// 🔥 ONLY allow safe fields
		const allowedFields = [
			"name",
			"contact",
			"room",
			"roomno",
			"checkin",
			"checkout",
			"status",
			"checkInTime",
			"checkOutTime",
			"actualCheckIn",
			"actualCheckOut",
			"totalBill",
			"activities",
			"totalActivities",
			"billActivities",
			"extraCharges",
			"billSummary",
			"noOfPersons",
			"adult",
			"child"
		];

		allowedFields.forEach((field) => {
			if (req.body[field] !== undefined) {
				booking[field] = req.body[field];
			}
		});

		// 🔥 Convert dates properly
		if (req.body.checkin) {
			booking.checkin = new Date(req.body.checkin);
		}
		if (req.body.checkout) {
			booking.checkout = new Date(req.body.checkout);
		}

		// 🔥 Parse activities safely
		if (req.body.activities && typeof req.body.activities === "string") {
			booking.activities = JSON.parse(req.body.activities);
		}

		// file update
		if (req.file) {
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


		/* ================= RECALCULATE ================= */
		// (Dynamic availability now handles this, no longer saving manually)

		res.json({ message: "Booking deleted" });

	} catch (err) {
		console.error("❌ DELETE BOOKING ERROR:", err);
		res.status(500).json({ error: err.message });
	}
});

/* ================= GET SINGLE BOOKING ================= */
router.get("/:id", async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ message: "Booking not found" });
		res.json(booking);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ================= FINALIZE BILL & CHECKOUT ================= */
router.put("/:id/finalize", async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ message: "Booking not found" });

		const { billActivities, extraCharges, billSummary } = req.body;

		booking.billActivities = billActivities || [];
		booking.extraCharges = extraCharges || [];
		booking.billSummary = billSummary || {};
		booking.totalBill = billSummary?.grandTotal || 0;
		booking.status = "Checked Out";
		booking.checkOutTime = new Date().toISOString();
		booking.actualCheckOut = new Date();

		await booking.save();
		res.json({ message: "Bill finalized", booking });
	} catch (err) {
		console.error("❌ FINALIZE ERROR:", err);
		res.status(500).json({ error: err.message });
	}
});

/* ================= CANCEL BOOKING ================= */
router.put("/:id/cancel", async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ message: "Booking not found" });

		if (booking.status === "Checked Out") {
			return res.status(400).json({ message: "Cannot cancel a completed booking" });
		}

		booking.status = "Cancelled";
		await booking.save();

		res.json({ message: "Booking cancelled successfully", booking });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ================= AVAILABILITY ================= */
router.get("/availability/:date", async (req, res) => {
	try {
		const selectedDate = new Date(req.params.date);
		selectedDate.setHours(0, 0, 0, 0);

		const bookings = await Booking.find({
			$and: [
				{ checkin: { $lte: selectedDate } },
				{ checkout: { $gt: selectedDate } }
			],
			status: { $ne: "Checked Out" }
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
