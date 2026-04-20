const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { protect } = require("../middleware/auth");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

/* ================= STORAGE ================= */
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: async (req, file) => ({
		folder: "rooms",
		format: file.mimetype.split("/")[1],
		public_id: Date.now() + "-" + file.originalname,
	}),
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
});

/* ================= HELPER: GENERATE ROOM NUMBERS ================= */
const generateRoomNumbers = (start, total) => {
	let rooms = [];
	for (let i = 0; i < total; i++) {
		rooms.push(start + i);
	}
	return rooms;
};

/* ================= GET ALL ROOMS ================= */
router.get("/", async (req, res) => {
	try {
		const rooms = await Room.find({});
		res.status(200).json(rooms);
	} catch (err) {
		console.error("ROOM ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

/* ================= ADD ROOM ================= */
router.post("/", protect, upload.array("images", 5), async (req, res) => {
	try {
		const { title, category, price, description, totalRooms, startRoomNo } = req.body;

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: "At least 1 image required" });
		}

		if (!startRoomNo) {
			return res.status(400).json({ message: "Start room number required" });
		}

		// ✅ Generate dynamic room numbers
		const roomNumbers = generateRoomNumbers(
			parseInt(startRoomNo),
			parseInt(totalRooms)
		);

		const room = new Room({
			title,
			category,
			price,
			description,
			totalRooms,
			roomNumbers,
			images: req.files.map(file => file.path),
		});

		await room.save();

		res.status(201).json(room);

	} catch (err) {
		console.error("ROOM ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

/* ================= UPDATE ROOM ================= */
router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
	try {
		const room = await Room.findById(req.params.id);
		if (!room) return res.status(404).json({ message: "Room not found" });

		const { totalRooms, startRoomNo } = req.body;

		Object.assign(room, req.body);

		// 🔥 Regenerate room numbers if changed
		if (totalRooms && startRoomNo) {
			room.roomNumbers = generateRoomNumbers(
				parseInt(startRoomNo),
				parseInt(totalRooms)
			);
		}

		// 🔥 Replace images if new uploaded
		if (req.files && req.files.length > 0) {
			for (let img of room.images) {
				const publicId = img.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy("rooms/" + publicId);
			}

			room.images = req.files.map(file => file.path);
		}

		await room.save();
		res.status(200).json(room);

	} catch (err) {
		console.error("ROOM ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

/* ================= DELETE ROOM ================= */
router.delete("/:id", protect, async (req, res) => {
	try {
		const room = await Room.findByIdAndDelete(req.params.id);
		if (!room) return res.status(404).json({ message: "Room not found" });

		if (room.images && room.images.length > 0) {
			for (let img of room.images) {
				const publicId = img.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy("rooms/" + publicId);
			}
		}

		res.status(200).json({ message: "Room deleted" });

	} catch (err) {
		console.error("ROOM ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;