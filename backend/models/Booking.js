const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  age: { type: String },
  gender: { type: String },
  room: { type: String, required: true },
  roomno: { type: Number },  // can be manually entered
  noOfPersons: { type: Number, default: 1 },
  adult: {type: Number, default: 1},
  child: {type: Number, default: 0},
  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Checked In", "Checked Out"], default: "Pending" },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  totalBill: { type: Number },
  docFile: { type: String },  // store filename/path
  docType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
