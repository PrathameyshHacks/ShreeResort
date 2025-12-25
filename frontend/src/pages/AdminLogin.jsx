import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;


  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/api/admin/login`,
        { email, password }
      );

      const token = res.data.token; // JWT from backend
      if (token) {

        // Save token in localStorage (or sessionStorage if not rememberMe)
        if (rememberMe) {
          localStorage.setItem("Token", token);
          localStorage.setItem("adminToken", token);
        } else {
          sessionStorage.setItem("adminToken", token);
        }

        alert("Admin Logged In Successfully");
        navigate("/admin"); // redirect to admin dashboard
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-box" onSubmit={handleLogin}>
        <h1>Admin Login</h1>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="login-options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember me
          </label>

          <Link to="/admin/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-text">
          Not an admin?{" "}
          <Link to="/signin" className="adLn">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}
