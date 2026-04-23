import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
//import "./MyBookings.css";

export default function MyBookings() {
	const API = "http://localhost:5000";

	const [bookingId, setBookingId] = useState("");
	const [booking, setBooking] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!bookingId.trim()) return;

		setLoading(true);
		setError("");
		try {
			const res = await axios.get(`${API}/api/bookings/${bookingId}`);
			setBooking(res.data);
		} catch (err) {
			setBooking(null);
			setError(err.response?.data?.message || "Booking not found");
		}
		setLoading(false);
	};

	const handleCancel = async () => {
		if (!window.confirm("Are you sure you want to cancel your booking?")) return;

		try {
			const res = await axios.put(`${API}/api/bookings/${booking._id}/cancel`);
			setBooking(res.data.booking);
			alert("Booking cancelled successfully.");
		} catch (err) {
			alert(err.response?.data?.message || "Cancellation failed");
		}
	};

	const formatDate = (iso) => {
		if (!iso) return "N/A";
		const d = new Date(iso);
		return d.toLocaleDateString();
	};

	return (
		<>
			<Navbar />
			<div className="my-bookings-container">
				<h1>My Bookings</h1>
				<form onSubmit={handleSearch} className="search-form">
					<input
						type="text"
						placeholder="Enter your Booking ID"
						value={bookingId}
						onChange={(e) => setBookingId(e.target.value)}
						required
					/>
					<button type="submit" disabled={loading}>
						{loading ? "Searching..." : "Find Booking"}
					</button>
				</form>

				{error && <p className="error-msg">{error}</p>}

				{booking && (
					<div className="booking-card">
						<div className="booking-header">
							<h2>Booking Details</h2>
							<span className={`status-badge ${booking.status.replace(" ", "-").toLowerCase()}`}>
								{booking.status}
							</span>
						</div>

						<div className="booking-info">
							<p><strong>Booking ID:</strong> {booking._id}</p>
							<p><strong>Name:</strong> {booking.name}</p>
							<p><strong>Contact:</strong> {booking.contact}</p>
							<p><strong>Room Type:</strong> {booking.room}</p>
							<p><strong>Room No:</strong> {booking.roomno || "To be assigned"}</p>
							<p><strong>Check-in:</strong> {formatDate(booking.checkin)}</p>
							<p><strong>Check-out:</strong> {formatDate(booking.checkout)}</p>
							<p><strong>Guests:</strong> {booking.noOfPersons}</p>
							{booking.totalBill && <p><strong>Total Bill:</strong> ₹{booking.totalBill}</p>}
						</div>

						{booking.activities && booking.activities.length > 0 && (
							<div className="activities-info">
								<h3>Selected Activities</h3>
								<ul>
									{booking.activities.map((act, i) => (
										<li key={i}>{act.name} - ₹{act.price}</li>
									))}
								</ul>
							</div>
						)}

						<div className="booking-actions">
							{/* Always show Booking Confirmation PDF */}
							<a href={`${API}/api/pdfs/booking/${booking._id}`} target="_blank" rel="noreferrer" className="btn-pdf">
								Download Confirmation PDF
							</a>

							{booking.status === "Cancelled" && (
								<a href={`${API}/api/pdfs/cancel/${booking._id}`} target="_blank" rel="noreferrer" className="btn-cancel-pdf">
									Download Cancellation PDF
								</a>
							)}

							{booking.status === "Checked Out" && (
								<a href={`${API}/api/pdfs/invoice/${booking._id}`} target="_blank" rel="noreferrer" className="btn-invoice-pdf">
									Download Invoice PDF
								</a>
							)}

							{(booking.status === "Pending" || booking.status === "Checked In") && (
								<button onClick={handleCancel} className="btn-cancel">
									Cancel Booking
								</button>
							)}
						</div>
					</div>
				)}
			</div>

			<Footer />
			<style>{`
				.my-bookings-container {
					min-height: 80vh;
					padding: 40px 20px;
					max-width: 800px;
					margin: 0 auto;
					font-family: Arial, sans-serif;
				}
				.my-bookings-container h1 {
					text-align: center;
					color: #0a4d91;
					margin-bottom: 20px;
				}
				.search-form {
					display: flex;
					gap: 10px;
					justify-content: center;
					margin-bottom: 30px;
				}
				.search-form input {
					padding: 10px;
					font-size: 16px;
					width: 300px;
					border: 1px solid #ccc;
					border-radius: 4px;
				}
				.search-form button {
					padding: 10px 20px;
					font-size: 16px;
					background: #0a4d91;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
				}
				.search-form button:hover {
					background: #083b70;
				}
				.error-msg {
					color: red;
					text-align: center;
					font-weight: bold;
				}
				.booking-card {
					background: #f9f9f9;
					border: 1px solid #ddd;
					border-radius: 8px;
					padding: 20px;
					box-shadow: 0 4px 6px rgba(0,0,0,0.1);
				}
				.booking-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 15px;
					border-bottom: 1px solid #ccc;
					padding-bottom: 10px;
				}
				.status-badge {
					padding: 5px 10px;
					border-radius: 20px;
					color: white;
					font-weight: bold;
					font-size: 14px;
				}
				.status-badge.pending { background: #ffc107; color: black; }
				.status-badge.checked-in { background: #17a2b8; }
				.status-badge.checked-out { background: #28a745; }
				.status-badge.cancelled { background: #dc3545; }

				.booking-info p {
					margin: 5px 0;
					font-size: 16px;
				}
				.activities-info {
					margin-top: 15px;
					background: #eef;
					padding: 10px;
					border-radius: 5px;
				}
				.activities-info h3 { margin-bottom: 5px; color: #333; }
				.booking-actions {
					margin-top: 20px;
					display: flex;
					gap: 15px;
					flex-wrap: wrap;
				}
				.booking-actions a, .booking-actions button {
					text-decoration: none;
					padding: 10px 15px;
					border-radius: 5px;
					color: white;
					font-weight: bold;
					text-align: center;
					border: none;
					cursor: pointer;
				}
				.btn-pdf { background: #007bff; }
				.btn-cancel-pdf { background: #6c757d; }
				.btn-invoice-pdf { background: #28a745; }
				.btn-cancel { background: #dc3545; }
				.booking-actions a:hover, .booking-actions button:hover { opacity: 0.8; }
			`}</style>
		</>
	);
}
