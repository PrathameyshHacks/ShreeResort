// Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
	{
		bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
		type:      { type: String, enum: ["room", "activity"], required: true },

		// For room reviews — the room title string (matches Room.title)
		roomName:   { type: String },

		// For activity reviews — the activity ObjectId
		activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
		activityName: { type: String },

		rating:     { type: Number, min: 1, max: 5, required: true },
		reviewText: { type: String, required: true, trim: true },
		userName:   { type: String, required: true },
	},
	{ timestamps: true }
);

// Prevent duplicate: one review per booking per room/activity
reviewSchema.index({ bookingId: 1, type: 1, roomName: 1,   activityId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
