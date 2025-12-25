const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

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
    const isStrong = password.length >= 8 &&
                     /[A-Z]/.test(password) &&
                     /[a-z]/.test(password) &&
                     /[0-9]/.test(password) &&
                     /[^A-Za-z0-9]/.test(password);

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

module.exports = router;
