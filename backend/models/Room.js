//Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
	title: { type: String, required: true },
	category: { type: String, required: true },
	price: { type: Number, required: true },

	images: {
		type: [String],
		required: true,
		validate: [arr => arr.length > 0 && arr.length <= 5, "1-5 images required"]
	},

	description: { type: String, required: true },

	totalRooms: { type: Number, default: 1 },

	// ✅ NEW FIELD (IMPORTANT)
	roomNumbers: {
		type: [Number],
		required: true,
		validate: [
			arr => arr.length > 0,
			"At least 1 room number required"
		]
	},

	bookedRooms: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
