const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  bookerName: { type: String, required: true },
  bookerContact: { type: String, required: true },
  memberName: { type: String, required: true },
  memberContact: { type: String },
  memberAge: { type: Number},
  memberGender: { type: String, required: true },
  roomNo: { type: String, required: true },
  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },
}, { timestamps: true });

const Guest = mongoose.model('Guest', guestSchema);
module.exports = Guest;
