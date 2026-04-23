import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminSign.css";

export default function AdminSign() {
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;


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
  }

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

      await axios.post(`${API}/api/admin/register`, formData);

      alert("Admin registered successfully");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>Admin Registration</h1>

        <form onSubmit={handleSubmit}>
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

          <div className="password-requirements-box">
            <p>Password must contain:</p>
            <ul>
              <li className={passwordValid.length ? "valid" : "invalid"}>
                {passwordValid.length ? "✓" : "○"} At least 8 characters
              </li>
              <li className={passwordValid.uppercase ? "valid" : "invalid"}>
                {passwordValid.uppercase ? "✓" : "○"} One uppercase letter
              </li>
              <li className={passwordValid.lowercase ? "valid" : "invalid"}>
                {passwordValid.lowercase ? "✓" : "○"} One lowercase letter
              </li>
              <li className={passwordValid.number ? "valid" : "invalid"}>
                {passwordValid.number ? "✓" : "○"} One number
              </li>
              <li className={passwordValid.special ? "valid" : "invalid"}>
                {passwordValid.special ? "✓" : "○"} One special character
              </li>
            </ul>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login" className="adLn">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
