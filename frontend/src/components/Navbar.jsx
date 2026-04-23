import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
	const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
        <>
		<div className="header">
			<div className="logo">
				<Link to="/" className="logo-link">
					🏨 Shree Moraya Lodge
				</Link>
			</div>

			<nav className="nav">
				<Link to="/">Dashboard</Link>
				<a href="/#features">Features</a>
				<Link to="/about">About</Link>
				<a href="/about/#contact-list">Contact</a>
				<Link to="/my-bookings">My Bookings</Link>
				<Link to="/booking" className="btn">Book Now</Link>
				<button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
					{theme === "light" ? "🌙" : "☀️"}
				</button>
			</nav>
		</div>
        <div className="dummyHead">


        </div>

        </>
	);
}
