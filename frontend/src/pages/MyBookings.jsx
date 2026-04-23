import React, { useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./MyBookings.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ─── Star Rating Input ─── */
function StarInput({ value, onChange, disabled }) {
	return (
		<span style={{ fontSize: "24px", cursor: disabled ? "default" : "pointer" }}>
			{[1, 2, 3, 4, 5].map(s => (
				<span
					key={s}
					onClick={() => !disabled && onChange(s)}
					style={{ color: s <= value ? "#f5a623" : "#ccc", marginRight: "2px" }}
				>
					★
				</span>
			))}
		</span>
	);
}

/* ─── Review Form for a single item ─── */
function ReviewForm({ label, alreadyReviewed, onSubmit, disabled }) {
	const [rating, setRating]     = useState(0);
	const [text, setText]         = useState("");
	const [submitting, setSub]    = useState(false);
	const [submitted, setSubmitted] = useState(false);

	if (alreadyReviewed || submitted) {
		return (
			<div className="reviewed-badge">
				✅ Review submitted — Thank you!
			</div>
		);
	}

	const handleSubmit = async () => {
		if (!rating) { alert("Please select a star rating"); return; }
		if (!text.trim()) { alert("Please write a review"); return; }
		setSub(true);
		const ok = await onSubmit(rating, text.trim());
		setSub(false);
		if (ok) setSubmitted(true);
	};

	return (
		<div className="review-form">
			<p className="review-label">{label}</p>
			<StarInput value={rating} onChange={setRating} disabled={disabled} />
			<textarea
				className="review-textarea"
				rows={3}
				placeholder="Write your review..."
				value={text}
				onChange={e => setText(e.target.value)}
				disabled={disabled}
			/>
			<button
				className="btn-primary"
				style={{ alignSelf: "flex-start", opacity: disabled || submitting ? 0.5 : 1 }}
				onClick={handleSubmit}
				disabled={disabled || submitting}
			>
				{submitting ? "Submitting..." : "Submit Review"}
			</button>
		</div>
	);
}

export default function MyBookings() {
	const [bookingId, setBookingId] = useState("");
	const [booking, setBooking]     = useState(null);
	const [error, setError]         = useState("");
	const [loading, setLoading]     = useState(false);
	// already-submitted reviews for this booking
	const [existingReviews, setExistingReviews] = useState([]);

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!bookingId.trim()) return;
		setLoading(true);
		setError("");
		setExistingReviews([]);
		try {
			const [bRes, rRes] = await Promise.all([
				axios.get(`${API}/api/bookings/${bookingId}`),
				axios.get(`${API}/api/reviews/booking/${bookingId}`).catch(() => ({ data: [] })),
			]);
			setBooking(bRes.data);
			setExistingReviews(rRes.data);
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
		return new Date(iso).toLocaleDateString();
	};

	/* ─── Submit review helper ─── */
	const submitReview = useCallback(async (payload) => {
		try {
			await axios.post(`${API}/api/reviews`, {
				...payload,
				bookingId:  booking._id,
				userName:   booking.name,
			});
			return true;
		} catch (err) {
			alert(err.response?.data?.message || "Review submission failed");
			return false;
		}
	}, [booking]);

	/* ─── Check if a review already exists ─── */
	const alreadyReviewedRoom = existingReviews.some(
		r => r.type === "room" && r.roomName === booking?.room
	);

	const alreadyReviewedActivity = (actName) =>
		existingReviews.some(r => r.type === "activity" && r.activityName === actName);

	const isCheckedOut = booking?.status === "Checked Out";

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
						{/* ─── Booking header ─── */}
						<div className="booking-header">
							<h2>Booking Details</h2>
							<span className={`status-badge ${booking.status.replace(" ", "-").toLowerCase()}`}>
								{booking.status}
							</span>
						</div>

						{/* ─── Booking info ─── */}
						<div className="booking-info">
							<p><strong>Booking ID:</strong> {booking._id}</p>
							<p><strong>Name:</strong> {booking.name}</p>
							<p><strong>Contact:</strong> {booking.contact}</p>
							<p><strong>Room Type:</strong> {booking.room}</p>
							<p><strong>Room No:</strong> {booking.roomno || "To be assigned"}</p>
							<p><strong>Check-in:</strong> {formatDate(booking.actualCheckIn || booking.checkin)}</p>
							<p><strong>Check-out:</strong> {formatDate(booking.actualCheckOut || booking.checkout)}</p>
							<p><strong>Guests:</strong> {booking.noOfPersons}</p>
							{booking.totalBill && <p><strong>Total Bill:</strong> ₹{booking.totalBill}</p>}
						</div>

						{/* ─── Activities list ─── */}
						{booking.activities?.length > 0 && (
							<div className="activities-info">
								<h3>Selected Activities</h3>
								<ul>
									{booking.activities.map((act, i) => (
										<li key={i}>{act.name} — ₹{act.price}</li>
									))}
								</ul>
							</div>
						)}

						{/* ─── PDF buttons ─── */}
						<div className="booking-actions">
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
								<button onClick={handleCancel} className="btn-cancel">Cancel Booking</button>
							)}
						</div>

						{/* ════════════════════════════════════════
						    REVIEW & RATING SECTION
						════════════════════════════════════════ */}
						<div className="review-section">
							<h2 className="review-heading">⭐ Reviews & Ratings</h2>

							{!isCheckedOut && (
								<div className="locked-msg">
									🔒 Reviews can be submitted only after checkout.
								</div>
							)}

							{/* Room Review */}
							<div className="review-block">
								<h3 className="block-title">🏨 Room Review — {booking.room}</h3>
								<ReviewForm
									label={`Rate your stay in ${booking.room}`}
									alreadyReviewed={alreadyReviewedRoom}
									disabled={!isCheckedOut}
									onSubmit={(rating, reviewText) =>
										submitReview({ type: "room", roomName: booking.room, rating, reviewText })
									}
								/>
							</div>

							{/* Activity Reviews */}
							{booking.activities?.length > 0 && (
								<div className="review-block">
									<h3 className="block-title">🏖️ Activity Reviews</h3>
									{booking.activities.map((act, i) => (
										<div key={i} style={{ marginBottom: "16px" }}>
											<ReviewForm
												label={`Rate activity: ${act.name}`}
												alreadyReviewed={alreadyReviewedActivity(act.name)}
												disabled={!isCheckedOut}
												onSubmit={(rating, reviewText) =>
													submitReview({
														type: "activity",
														activityId: act.activityId,
														activityName: act.name,
														rating,
														reviewText,
													})
												}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<Footer />
		</>
	);
}
