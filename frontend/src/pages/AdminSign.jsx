import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminSign.css";

export default function AdminSign() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
  });

  const [passwordValid, setPasswordValid] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      setPasswordValid({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
      });
    }

    setFormData({ ...formData, [name]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isStrongPassword = Object.values(passwordValid).every(Boolean);

    if (!isStrongPassword) {
      alert("Password does not meet all requirements");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/admin/register", formData);

      alert("Admin registered successfully");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="allP">
      <div className="AdminCont">
        <h1>Admin Registration</h1>

        <form onSubmit={handleSubmit} className="AdForm">
          <input
            type="text"
            name="name"
            placeholder="Administrator Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Administrator Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <ul className="password-requirements">
            <li style={{ color: passwordValid.length ? "green" : "red" }}>
              At least 8 characters
            </li>
            <li style={{ color: passwordValid.uppercase ? "green" : "red" }}>
              One uppercase letter
            </li>
            <li style={{ color: passwordValid.lowercase ? "green" : "red" }}>
              One lowercase letter
            </li>
            <li style={{ color: passwordValid.number ? "green" : "red" }}>
              One number
            </li>
            <li style={{ color: passwordValid.special ? "green" : "red" }}>
              One special character
            </li>
          </ul>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" className="adLl">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
