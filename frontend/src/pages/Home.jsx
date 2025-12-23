import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";
import scuba from "../images/scuba.PNG";
import gpule from "../images/GanPule.png";
import malvan from "../images/dapoli.jpg";
import lodge from "../images/lodge.jpg";
import fort from "../images/Sindh2.png";



export default function LandingPage() {
	const navigate = useNavigate();
	const [showPricePopup, setShowPricePopup] = useState(false);

	/* 🔁 HERO SLIDESHOW IMAGES */
	const heroImages = [
		"https://images.unsplash.com/photo-1566073771259-6a8506099945",
		scuba,gpule,malvan,lodge,fort
	];

	const [currentIndex, setCurrentIndex] = useState(0);

	/* ⏱️ Change image every 5 seconds */
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % heroImages.length);
		}, 6000);

		return () => clearInterval(interval);
	}, []);

	/* 🔒 Disable background scroll when price popup is open */
	useEffect(() => {
		document.body.style.overflow = showPricePopup ? "hidden" : "auto";
		return () => (document.body.style.overflow = "auto");
	}, [showPricePopup]);

	return (
		<>
			<Navbar />

			<div className="landing-page">
				{/* HERO SECTION WITH SLIDESHOW */}
				<section
					className="hero"
					style={{
						backgroundImage: `url(${heroImages[currentIndex]})`
					}}
				>
					<div className="hero-content">
						<h1>
							Welcome to <span>Shree Morya Lodge</span>
						</h1>
						<p>Explore Konkan with us – your perfect stay awaits ✨</p>
						<Link to="/booking" className="cta-btn">
							Start Booking
						</Link>
					</div>
				</section>

				{/* FEATURES */}
				<section id="features" className="features">
					<h1>Why Choose Us?</h1>

					<div className="feature-cards">
						<div className="card" onClick={() => navigate("/booking")}>
							<h3>📅 Online Booking</h3>
							<p>Book your stay easily from anywhere, anytime.</p>
						</div>

						<div className="card" onClick={() => setShowPricePopup(true)}>
							<h3>💰 Affordable Price</h3>
							<p>Click to view room prices & special offers.</p>
						</div>

						<div className="card" onClick={() => navigate("/tourist")}>
							<h3>🗺️ Nearby Attractions</h3>
							<p>Discover popular nearby attractions with ease.</p>
						</div>
					</div>
				</section>

				<div className="about-page">
					<h1>About Shree Morya Lodge</h1>

					<div className="about-content">
						<p>
							Welcome to <strong>Shree Morya Lodge</strong>, your perfect getaway in the serene town of 
							<strong> Ganpatipule</strong>. Located approximately <strong>25 km from Ratnagiri city</strong> and just 
							<strong>5 minutes away from the famous Ganapatipule Ganapati Temple</strong>, our lodge is also situated 
							close to the beautiful Ganapatipule beach. We provide a comfortable stay with a warm, homely atmosphere 
							for families, couples, and travelers.
						</p>

						<p>
							Shree Morya Lodge has been proudly <strong>serving guests since 2010</strong> and offers a total of 
							<strong>15 Non-AC rooms and 15 AC rooms</strong>, each equipped with two beds and suitable for 
							<strong>2 adults and 2 children</strong>. Additionally, we have <strong>3 spacious halls with 5 beds each</strong>, 
							ideal for families or friend groups, accommodating up to <strong>10–15 people</strong>. 
							The lodge also assists guests with <strong>local tourism guidance, nearby attractions, water sports, 
							and travel support</strong>, ensuring a pleasant and memorable stay.
						</p>

						<p>
							This website is developed as part of a sponsored academic project, focusing on digital transformation 
							in hospitality by providing features such as <strong>online room booking, customer reviews, tourist information, 
							and efficient booking management</strong>, making the overall experience smarter, faster, and more user-friendly.
						</p>


						<ul className="contact-list">
							<h1>Contact Information</h1>
							<li><strong>Address:</strong> Near Toll Naka, Ganpatipule, Maharashtra</li>
							<li><strong>Phone:</strong> <a href="tel:+918888372061">+91 88883 72061</a></li>
							<li><strong>Email:</strong> <a href="mailto:info@moryalodge.com">info@moryalodge.com</a></li>
							<li><strong>Map:</strong> <a href="https://maps.google.com?q=Ganpatipule+Toll+Naka" target="_blank" rel="noreferrer">View on Google Maps</a></li>
						</ul>
					</div>
				</div>
				
				<Footer />
			</div>

			{/* 💰 PRICE POPUP */}
			{showPricePopup && (
				<div className="price-overlay" onClick={() => setShowPricePopup(false)}>
					<div className="price-modal" onClick={(e) => e.stopPropagation()}>
						<h2>💰 Room Prices / Day</h2>

						<ul>
							<li><strong>Non-AC Standard Room:</strong> ₹800 / day</li>
							<li><strong>AC Deluxe Room:</strong> ₹1200 / day</li>
							<li><strong>Family Suite:</strong> ₹1800 / day</li>
						</ul>

						<h3>🎁 Special Offers</h3>
						<p>✔ 10% discount on 3+ days stay</p>
						<p>✔ Free early check-in (subject to availability)</p>
						<p>✔ Festival season special offers</p>

						<button className="close-btn" onClick={() => setShowPricePopup(false)}>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
}
