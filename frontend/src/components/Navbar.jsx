import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
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
				<Link to="/booking" className="btn">Book Now</Link>
			</nav>
		</div>
        <div className="dummyHead">


        </div>

        </>
	);
}
