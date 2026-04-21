const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const adminRoutes = require("./routes/admin");
const roomRoutes = require("./routes/rooms");
const guestRoutes = require("./routes/guests");
const bookingRoutes = require("./routes/bookings");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= CORS ================= */

const allowedOrigins = [
	"http://localhost:3000",
	process.env.FRONTEND_URL // deployed frontend
];

app.use(cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);

		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"]
}));

/* ================= MIDDLEWARE ================= */

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/admin", adminRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/guests", guestRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
	res.send("API is running...");
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
});
