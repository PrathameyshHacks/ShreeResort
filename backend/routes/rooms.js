const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { protect } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) cb(new Error("Only images allowed"));
    else cb(null, true);
  },
});

// GET all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD room
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const roomData = req.body;
    if (req.file) roomData.image = "/uploads/" + req.file.filename;
    const room = new Room(roomData);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE room
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    Object.assign(room, req.body);

    if (req.file) {
      // Delete old file
      if (room.image && fs.existsSync(path.join(__dirname, "..", room.image))) {
        fs.unlinkSync(path.join(__dirname, "..", room.image));
      }
      room.image = "/uploads/" + req.file.filename;
    }

    await room.save();
    res.status(200).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE room
router.delete("/:id", protect, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    // Removed room.remove() — not needed
    res.status(200).json({ message: "Room deleted" });
  } catch (err) {
    console.error("DELETE ROOM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
