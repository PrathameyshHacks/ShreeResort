const express = require("express");
const router = express.Router();
const Guest = require("../models/Guest");

/* ================= GET ALL GUESTS ================= */
router.get("/", async (req, res) => {
	try {
		const guests = await Guest.find().sort({ createdAt: -1 });
		res.json(guests);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ================= CREATE SINGLE GUEST (KEEPING YOUR LOGIC) ================= */
router.post("/", async (req, res) => {
	try {
		const {
			bookerName,
			bookerContact,
			memberName,
			memberContact,
			memberAge,
			memberGender,
			roomNo,
			checkin,
			checkout,
		} = req.body;

		if (!bookerName || !bookerContact || !memberName || !memberAge || !memberGender) {
			return res.status(400).json({ message: "Required fields missing" });
		}

		const newGuest = new Guest({
			bookerName,
			bookerContact,
			memberName,
			memberContact,
			memberAge,
			memberGender,
			roomNo,
			checkin,
			checkout,
		});

		await newGuest.save();
		res.status(201).json(newGuest);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ================= CREATE MULTIPLE GUESTS (RECOMMENDED) ================= */
/*
Expected body:
{
  "bookerName": "Prathamesh",
  "bookerContact": "9876543210",
  "roomNo": 203,
  "checkin": "2025-10-15",
  "checkout": "2025-10-18",
  "members": [
    { "name": "A", "age": 25, "gender": "Male", "contact": "99999" },
    { "name": "B", "age": 22, "gender": "Female" }
  ]
}
*/
router.post("/bulk", async (req, res) => {
	try {
		const { bookerName, bookerContact, roomNo, checkin, checkout, members } = req.body;

		if (!bookerName || !bookerContact || !roomNo || !members || !Array.isArray(members)) {
			return res.status(400).json({ message: "Invalid payload" });
		}

		const guestsToInsert = members.map(m => ({
			bookerName,
			bookerContact,
			memberName: m.name,
			memberContact: m.contact || "",
			memberAge: m.age,
			memberGender: m.gender,
			roomNo,
			checkin,
			checkout,
		}));

		const savedGuests = await Guest.insertMany(guestsToInsert);
		res.status(201).json(savedGuests);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ================= UPDATE GUEST ================= */
router.put("/:id", async (req, res) => {
	try {
		const guest = await Guest.findById(req.params.id);
		if (!guest) return res.status(404).json({ message: "Guest not found" });

		Object.assign(guest, req.body);
		await guest.save();

		res.json(guest);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ================= DELETE GUEST ================= */
router.delete("/:id", async (req, res) => {
	try {
		const guest = await Guest.findByIdAndDelete(req.params.id);
		if (!guest) return res.status(404).json({ message: "Guest not found" });

		res.json({ message: "Guest deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
