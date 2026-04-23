const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const { protect } = require("../middleware/auth");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

/* ================= CLOUDINARY CONFIG ================= */
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

/* ================= STORAGE ================= */
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: async (req, file) => ({
		folder: "activities",
		format: file.mimetype.split("/")[1],
		public_id: Date.now() + "-" + file.originalname,
	}),
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
});

/* ================= GET ALL ACTIVITIES ================= */
router.get("/", async (req, res) => {
	try {
		const activities = await Activity.find({});
		res.status(200).json(activities);
	} catch (err) {
		console.error("ACTIVITY ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

/* ================= ADD ACTIVITY ================= */
router.post("/", protect, upload.array("images", 5), async (req, res) => {
	try {
		const { name, price, duration, location, description } = req.body;

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: "At least 1 image required" });
		}

		const activity = new Activity({
			name,
			price,
			duration,
			location,
			description,
			images: req.files.map(file => file.path),
		});

		await activity.save();

		res.status(201).json(activity);

	} catch (err) {
		console.error("ACTIVITY ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

/* ================= UPDATE ACTIVITY ================= */
router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
	try {
		const activity = await Activity.findById(req.params.id);
		if (!activity) return res.status(404).json({ message: "Activity not found" });

		Object.assign(activity, req.body);

		// 🔥 Replace images if new uploaded
		if (req.files && req.files.length > 0) {
			for (let img of activity.images) {
				const publicId = img.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy("activities/" + publicId);
			}

			activity.images = req.files.map(file => file.path);
		}

		await activity.save();
		res.status(200).json(activity);

	} catch (err) {
		console.error("ACTIVITY ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

/* ================= DELETE ACTIVITY ================= */
router.delete("/:id", protect, async (req, res) => {
	try {
		const activity = await Activity.findByIdAndDelete(req.params.id);
		if (!activity) return res.status(404).json({ message: "Activity not found" });

		if (activity.images && activity.images.length > 0) {
			for (let img of activity.images) {
				const publicId = img.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy("activities/" + publicId);
			}
		}

		res.status(200).json({ message: "Activity deleted" });

	} catch (err) {
		console.error("ACTIVITY ERROR:", err);
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
