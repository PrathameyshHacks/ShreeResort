//Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },

  age: { type: Number },
  gender: { type: String },

  room: { type: String, required: true },
  roomno: { type: Number, required: true },

  // Optional adult/child
  adult: { type: Number, default: 0 },
  child: { type: Number, default: 0 },

  noOfPersons: { type: Number, default: 1 },

  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },

  // ✅ STATUS
  status: {
    type: String,
    enum: ["Pending", "Checked In", "Checked Out", "Cancelled"],
    default: "Pending"
  },

  // ✅ DISPLAY TIMES (STRING)
  checkInTime: { type: String },
  checkOutTime: { type: String },

  // ✅ ACTUAL STAY DATES (IMPORTANT 🔥)
  actualCheckIn: { type: Date },
  actualCheckOut: { type: Date },

  // ✅ BILLING
  totalBill: { type: Number },

  // ✅ DOCUMENT
  docFile: { type: String },
  docType: { type: String },

  // ✅ ACTIVITIES (existing - kept for backward compat)
  activities: [
    {
      activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
      name: { type: String },
      price: { type: Number }
    }
  ],

  totalActivities: { type: Number, default: 0 },

  // ✅ BILL REVIEW - activities with persons breakdown
  billActivities: [
    {
      name: { type: String },
      pricePerPerson: { type: Number },
      persons: { type: Number },
      total: { type: Number }
    }
  ],

  // ✅ EXTRA CHARGES (food, damage, etc.)
  extraCharges: [
    {
      chargeType: { type: String },
      amount: { type: Number }
    }
  ],

  // ✅ FINAL BILL SUMMARY
  billSummary: {
    roomTotal: { type: Number, default: 0 },
    activityTotal: { type: Number, default: 0 },
    extraChargesTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  }

}, { timestamps: true });


// 🔥 Auto-calculate total persons
bookingSchema.pre("save", function () {
  if (!this.noOfPersons || this.noOfPersons <= 0) {
    const total = (this.adult || 0) + (this.child || 0);
    this.noOfPersons = total > 0 ? total : 1;
  }
});

// 🔥 Index for fast room conflict queries
bookingSchema.index({ room: 1, checkin: 1, checkout: 1 });

module.exports = mongoose.model("Booking", bookingSchema);