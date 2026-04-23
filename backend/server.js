const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const adminRoutes = require("./routes/admin");
const roomRoutes = require("./routes/rooms");
const guestRoutes = require("./routes/guests");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */

app.use(cors({
	origin: [
		"http://localhost:3000",
		process.env.FRONTEND_URL // for deployed frontend
	],
	credentials: true
}));

/* ================= MIDDLEWARE ================= */

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/admin", adminRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/guests", guestRoutes);
app.use("/api/activities", require("./routes/activities"));
app.use("/api/pdfs",       require("./routes/pdfs"));
app.use("/api/reviews",    require("./routes/reviews"));

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
	res.send("API is running...");
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});
