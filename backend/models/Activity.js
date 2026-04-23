const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
	name: { type: String, required: true },
	price: { type: Number, required: true },
	duration: { type: String, required: true },
	location: { type: String, required: true },
	images: {
		type: [String],
		required: true,
		validate: [arr => arr.length > 0 && arr.length <= 5, "1-5 images required"]
	},
	description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
