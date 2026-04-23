import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminNav.css";

function AdminNav() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // remove token from localStorage
    localStorage.removeItem("Token");
    sessionStorage.removeItem("adminToken"); // remove token from sessionStorage
    window.location.href = "/login"; // redirect to login page
  };



  return (
    <>
      <div className="AdNav">
        <div className="logo">
          <Link to="/admin" className="logo-link">
            🏨 Shree Moraya Lodge Admin
          </Link>
        </div>
        <nav className="nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/rooms">Rooms</Link>
          <Link to="/admin/activities">Activities</Link>
          <Link to="/admin/reports">Reports</Link>
          <Link to="/admin/profile">Profile</Link>
          <Link to="/login" className="btn" onClick={handleLogout}>Logout</Link>
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </nav>
      </div>
      <div className="dummyHead"></div>
    </>
  );
}

export default AdminNav;