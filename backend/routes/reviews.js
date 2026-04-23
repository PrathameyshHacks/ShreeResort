// reviews.js
const express  = require("express");
const router   = express.Router();
const Review   = require("../models/Review");
const Booking  = require("../models/Booking");

/* ───────────────────────────────────────────────
   POST /api/reviews
   Submit a review (room or activity).
   Validates: booking must be "Checked Out".
   Prevents: duplicates via DB unique index.
─────────────────────────────────────────────── */
router.post("/", async (req, res) => {
	try {
		const { bookingId, type, roomName, activityId, activityName, rating, reviewText, userName } = req.body;

		if (!bookingId || !type || !rating || !reviewText || !userName) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		// 🔒 GATE: booking must be checked out
		const booking = await Booking.findById(bookingId);
		if (!booking) return res.status(404).json({ message: "Booking not found" });
		if (booking.status !== "Checked Out") {
			return res.status(403).json({ message: "Reviews can only be submitted after checkout" });
		}

		// 🔒 Verify: room/activity belongs to this booking
		if (type === "room" && booking.room !== roomName) {
			return res.status(403).json({ message: "Room does not match this booking" });
		}
		if (type === "activity") {
			const hasActivity = (booking.activities || []).some(
				a => String(a.activityId) === String(activityId) || a.name === activityName
			);
			if (!hasActivity) return res.status(403).json({ message: "Activity not booked in this reservation" });
		}

		const review = await Review.create({
			bookingId, type, roomName, activityId, activityName,
			rating: Number(rating), reviewText, userName,
		});

		res.status(201).json({ message: "Review submitted", review });

	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({ message: "You have already reviewed this item for this booking" });
		}
		console.error("❌ REVIEW ERROR:", err);
		res.status(500).json({ error: err.message });
	}
});

/* ───────────────────────────────────────────────
   GET /api/reviews?type=room&roomName=...
   GET /api/reviews?type=activity&activityId=...
   GET /api/reviews            → all reviews (admin)
─────────────────────────────────────────────── */
router.get("/", async (req, res) => {
	try {
		const filter = {};
		if (req.query.type)       filter.type       = req.query.type;
		if (req.query.roomName)   filter.roomName   = req.query.roomName;
		if (req.query.activityId) filter.activityId = req.query.activityId;

		const reviews = await Review.find(filter).sort({ createdAt: -1 });
		res.json(reviews);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ───────────────────────────────────────────────
   GET /api/reviews/booking/:bookingId
   Fetch all reviews for a specific booking
   (used in MyBookings to know what's already submitted)
─────────────────────────────────────────────── */
router.get("/booking/:bookingId", async (req, res) => {
	try {
		const reviews = await Review.find({ bookingId: req.params.bookingId });
		res.json(reviews);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ───────────────────────────────────────────────
   GET /api/reviews/summary/room/:roomName
   Returns { avgRating, count, reviews[] }
─────────────────────────────────────────────── */
router.get("/summary/room/:roomName", async (req, res) => {
	try {
		const reviews = await Review.find({ type: "room", roomName: req.params.roomName })
			.sort({ createdAt: -1 })
			.limit(20);
		const avg = reviews.length
			? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
			: null;
		res.json({ avgRating: avg, count: reviews.length, reviews });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ───────────────────────────────────────────────
   GET /api/reviews/summary/activity/:activityId
─────────────────────────────────────────────── */
router.get("/summary/activity/:activityId", async (req, res) => {
	try {
		const reviews = await Review.find({ type: "activity", activityId: req.params.activityId })
			.sort({ createdAt: -1 })
			.limit(20);
		const avg = reviews.length
			? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
			: null;
		res.json({ avgRating: avg, count: reviews.length, reviews });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

/* ───────────────────────────────────────────────
   DELETE /api/reviews/:id   (admin only)
─────────────────────────────────────────────── */
router.delete("/:id", async (req, res) => {
	try {
		await Review.findByIdAndDelete(req.params.id);
		res.json({ message: "Review deleted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
