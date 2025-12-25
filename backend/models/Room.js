const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  totalRooms: { type: Number, default: 1 },
  bookedRooms: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
