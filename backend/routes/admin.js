const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/auth");

// PASSWORD VALIDATION (BACKEND)
const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, contact, password } = req.body;

    // Password strength validation
    const isStrong = isStrongPassword(password);

    if (!isStrong) {
      return res.status(400).json({ message: "Weak password" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

    // Create new Admin instance and save
    const admin = new Admin({ name, email, contact, password });
    await admin.save(); // ✅ triggers pre-save hook and hashes password

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});


// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET Admin Profile
router.get("/profile", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE Admin Profile
router.put("/profile", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const { name, email, password } = req.body;

    admin.name = name || admin.name;
    admin.email = email || admin.email;

    if (password) {
      const isStrong = isStrongPassword(password);
      if (!isStrong) {
        return res.status(400).json({ message: "Weak password. Password must contain at least 8 characters, an uppercase and lowercase letter, a number, and a special character." });
      }
      admin.password = password;
    }

    await admin.save();
    
    res.json({ message: "Profile updated successfully", name: admin.name, email: admin.email });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;