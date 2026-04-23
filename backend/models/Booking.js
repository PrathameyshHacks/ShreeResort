const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },

  age: { type: Number },
  gender: { type: String },

  room: { type: String, required: true },
  roomno: { type: Number, required: true },

  // Optional adult/child
  adult: { type: Number, default: 0 },   // <= default 0
  child: { type: Number, default: 0 },   // <= default 0

  noOfPersons: { type: Number }, // optional (can calculate)

  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },

  status: {
    type: String,
    enum: ["Pending", "Checked In", "Checked Out", "Cancelled"],
    default: "Pending"
  },

  checkInTime: { type: String },
  checkOutTime: { type: String },

  totalBill: { type: Number },

  docFile: { type: String },
  docType: { type: String },

  // 🔥 Tourism Activities
  activities: [
    {
      activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
      name: { type: String },
      price: { type: Number }
    }
  ],

  totalActivities: { type: Number, default: 0 }

}, { timestamps: true });


// 🔥 Auto-calculate total persons before saving
bookingSchema.pre("save", function () {
  this.noOfPersons = (this.adult || 0) + (this.child || 0);
});

bookingSchema.index({ room: 1, checkin: 1, checkout: 1 });

module.exports = mongoose.model("Booking", bookingSchema);