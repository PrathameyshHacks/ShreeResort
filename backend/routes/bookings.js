const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Guest = require("../models/Guest");
const Room = require("../models/Room");
const multer = require("multer");

/* ================= FILE UPLOAD ================= */
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, "uploads/"),
	filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
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

/* ================= CREATE BOOKING + GUESTS ================= */
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
			console.log("❌ Missing required fields");
			return res.status(400).json({ message: "Missing required fields" });
		}

		/* ================= FIND ROOM ================= */
		const roomDoc = await Room.findOne({ title: room });
		if (!roomDoc) {
			console.log("❌ Room not found:", room);
			return res.status(404).json({ message: "Room not found" });
		}

		console.log("🏨 Room found:", roomDoc.title);
		console.log("Total Rooms:", roomDoc.totalRooms);

		/* ================= DATE OVERLAP CHECK ================= */
		const overlappingBookings = await Booking.countDocuments({
			room,
			checkin: { $lt: new Date(checkout) },
			checkout: { $gt: new Date(checkin) },
		});

		console.log("📆 Overlapping bookings:", overlappingBookings);

		if (overlappingBookings >= roomDoc.totalRooms) {
			console.log("🚫 No vacant rooms available");
			return res.status(400).json({
				message: "All rooms are booked for selected dates",
			});
		}

		if (roomno) {
		  const conflictingRoom = await Booking.findOne({
		    room,
		    roomno,
		    checkin: { $lt: new Date(checkout) },
		    checkout: { $gt: new Date(checkin) },
		  });
	  
		  if (conflictingRoom) {
		    return res.status(400).json({
		      message: `Room ${roomno} is already booked for the selected dates`,
		    });
		  }
		}


		/* ================= CREATE BOOKING ================= */
		const newBooking = new Booking({
			name,
			contact,
			room,
			roomno: roomno || null,
			checkin,
			checkout,
			adult: Number(adult) || 1,
			child: Number(child) || 0,
			noOfPersons: Number(adult || 1) + Number(child || 0),
			docFile: req.file?.filename,
			docType: req.file?.mimetype,
		});

		await newBooking.save();
		console.log("✅ Booking saved:", newBooking._id);

		/* ================= UPDATE BOOKED ROOMS (CACHE) ================= */
		roomDoc.bookedRooms = overlappingBookings + 1;
		await roomDoc.save();
		console.log("📊 Updated bookedRooms:", roomDoc.bookedRooms);

		/* ================= SAVE MEMBERS ================= */
		if (members) {
			const parsedMembers = JSON.parse(members);
			console.log("👥 Members count:", parsedMembers.length);

			for (const m of parsedMembers) {
				await Guest.create({
					bookerName: name,
					bookerContact: contact,
					memberName: m.name,
					memberContact: m.contact,
					memberAge: m.age,
					memberGender: m.gender,
					roomNo: roomno || "TBD",
					checkin,
					checkout,
				});
			}
		}

		// Add booker as a guest automatically
		await Guest.create({
		  bookerName: name,
		  bookerContact: contact,
		  memberName: name,
		  memberContact: contact,
		  memberAge: 25, // or optional, you can skip or pass null
		  memberGender: "N/A", // optional
		  roomNo: roomno || "TBD",
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
		console.log("✏️ Updating booking:", req.params.id);

		const booking = await Booking.findById(req.params.id);
		if (!booking) {
			console.log("❌ Booking not found");
			return res.status(404).json({ message: "Booking not found" });
		}

		Object.assign(booking, req.body);

		if (req.file) {
			booking.docFile = req.file.filename;
			booking.docType = req.file.mimetype;
		}

		await booking.save();
		console.log("✅ Booking updated");

		res.json(booking);
	} catch (err) {
		console.error("❌ UPDATE BOOKING ERROR:", err);
		res.status(500).json({ error: err.message });
	}
});

/* ================= DELETE BOOKING ================= */
router.delete("/:id", async (req, res) => {
	try {
		console.log("🗑️ Deleting booking:", req.params.id);

		const booking = await Booking.findById(req.params.id);
		if (!booking) {
			return res.status(404).json({ message: "Booking not found" });
		}

		// Delete all guests for this booking
    	await Guest.deleteMany({
    	  bookerName: booking.name,
    	  bookerContact: booking.contact,
    	});

		await Booking.findByIdAndDelete(req.params.id);
		await Guest.deleteMany({ roomNo: booking.roomno });

		/* ================= RECALCULATE BOOKED ROOMS ================= */
		const roomDoc = await Room.findOne({ title: booking.room });
		if (roomDoc) {
			const activeBookings = await Booking.countDocuments({
				room: booking.room,
				checkout: { $gt: new Date() },
			});
			roomDoc.bookedRooms = activeBookings;
			await roomDoc.save();
			console.log("📊 Recalculated bookedRooms:", activeBookings);
		}

		res.json({ message: "Booking & guests deleted" });

	} catch (err) {
		console.error("❌ DELETE BOOKING ERROR:", err);
		res.status(500).json({ error: err.message });
	}
});


// ================= ROOM AVAILABILITY BY DATE =================
router.get("/availability/:date", async (req, res) => {
	try {
		const selectedDate = new Date(req.params.date);

		const bookings = await Booking.find({
			checkin: { $lte: selectedDate },
			checkout: { $gt: selectedDate },
		});

		// Group by room
		const availability = {};
		bookings.forEach(b => {
			availability[b.room] = (availability[b.room] || 0) + 1;
		});

		const result = Object.keys(availability).map(room => ({
			room,
			count: availability[room],
		}));

		res.json(result); // e.g., [{room: "AC", count: 2}, ...]
	} catch (err) {
		console.error("AVAILABILITY ERROR:", err);
		res.status(500).json({ message: "Failed to fetch availability" });
	}
});



module.exports = router;
