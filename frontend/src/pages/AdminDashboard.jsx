import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";


export default function AdminDashboard() {
	const navigate = useNavigate();

	  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/login"); // redirect if token is missing
    }
  }, [navigate]);


	return (
		<div className="admin-dashboard">
			{/* Header */}
			<AdminNav/>

			{/* Hero Section */}
			<section className="hero">
				<div className="hero-content">
					<h1>Welcome to <span>Shree Moraya Lodge Admin Desk</span></h1>
					<p>Manage your hotel with ease and our expert solutions ✨</p>
					<a href="/admin/bookings" className="cta-btn">Manage Bookings</a>
				</div>
			</section>

			{/* Admin Options */}
			<section className="admin-options">
				<h2>What would you like to manage?</h2>
				<div className="options-cards">
					<div className="card" onClick={() => navigate("/admin/bookings")}>
						<h3>📋 Manage Bookings</h3>
						<p>View and manage all guest bookings.</p>
					</div>
					<div className="card" onClick={() => navigate("/admin/rooms")}>
						<h3>🛏 Manage Rooms</h3>
						<p>Update room details and availability.</p>
					</div>
					<div className="card" onClick={() => navigate("/admin/reports")}>
						<h3>📊 Reports</h3>
						<p>View financial and occupancy reports.</p>
					</div>
				</div>
			</section>

			{/* Footer */}
			<Footer/>

			{/* Inline CSS */}
			<style>{`
				/* Global styles */
				* {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}
				

				/* Header */
				
				/* Hero Section */
				.hero {
					background: url('https://images.unsplash.com/photo-1566073771259-6a8506099945') center/cover no-repeat;
					height: 80vh;
					display: flex;
					align-items: center;
					justify-content: center;
					text-align: center;
					color: #fff;
					position: relative;
				}
				.hero::after {
					content: "";
					position: absolute;
					inset: 0;
					background: rgba(0, 0, 0, 0.4);
				}
				.hero-content {
					position: relative;
					z-index: 1;
				}
				.hero-content h1 {
					font-size: 36px;
					margin-bottom: 20px;
					font-weight: 600;
				}
				.hero-content h1 span {
					color: #ffd700;
				}
				.hero-content p {
					font-size: 20px;
					margin-bottom: 30px;
				}
				.cta-btn {
					background-color: #ffd700;
					color: #000;
					padding: 12px 25px;
					font-weight: bold;
					border-radius: 5px;
					text-decoration: none;
					transition: background-color 0.3s ease;
				}
				.cta-btn:hover {
					background-color: #e0c100;
				}

				/* Admin Options */
				.admin-options {
					padding: 60px 20px;
					text-align: center;
					background-color: #ffffff;
				}
				.admin-options h2 {
					margin-bottom: 30px;
					font-size: 28px;
					color: #0a4d91;
				}
				.options-cards {
					display: flex;
					justify-content: center;
					flex-wrap: wrap;
					gap: 30px;
				}
				.card {
					background: white;
					padding: 20px;
					width: 280px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					border-radius: 8px;
					cursor: pointer;
					transition: transform 0.3s ease, box-shadow 0.3s ease;
				}
				.card:hover {
					color: darkcyan;
					transform: translateY(-5px);
					box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
					
				}
				.card h3 {
					margin-bottom: 10px;
					color: #0a4d91;
					font-size: 22px;
				}
				.card p {
					color: #666;
					font-size: 16px;
				}

				
			`}</style>
		</div>
	);
}
