const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const roomRoutes = require("./routes/rooms");
const guestRoutes = require("./routes/guests"); // Add the guest routes
const path = require("path");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Admin and Room routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/rooms", roomRoutes);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Booking Routes
app.use("/api/bookings", require("./routes/bookings"));

// Guest Routes
app.use("/api/guests", guestRoutes); // Register guest routes here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
