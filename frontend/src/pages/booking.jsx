//booking.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import "./Booking.css";

export default function BookingPage() {

	const API = process.env.REACT_APP_API_URL;


	const today = new Date().toISOString().split("T")[0];

	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);

	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [zoomImage, setZoomImage] = useState(null);

	const [availabilityMap, setAvailabilityMap] = useState({});

	const [activities, setActivities] = useState([]);
	const [selectedActivities, setSelectedActivities] = useState([]);
	const [bookingSuccessData, setBookingSuccessData] = useState(null);

	const [formData, setFormData] = useState({
		name: "",
		contact: "",
		gender: "",
		age: "",
		checkin: "",
		checkout: "",
		numAdults: 1,
		numChildren: 0,
		idfile: null,
		members: []
	});

	/* ================= FETCH ROOMS ================= */

	useEffect(() => {
		const fetchRooms = async () => {
			try {
				const res = await axios.get(`${API}/api/rooms`);
				setRooms(res.data);
			} catch (err) {
				console.error("ROOM FETCH ERROR:", err);
			} finally {
				setLoading(false); // ✅ ALWAYS runs
			}
		};

		fetchRooms();
	}, []);

	useEffect(() => {
		const fetchActivities = async () => {
			try {
				const res = await axios.get(`${API}/api/activities`);
				setActivities(res.data);
			} catch (err) {
				console.error("ACTIVITY FETCH ERROR:", err);
			}
		};
		fetchActivities();
	}, []);


	useEffect(() => {
		const fetchAvailability = async () => {
			try {
				let temp = {};

				for (let i = 0; i < 7; i++) {
					const date = new Date();
					date.setDate(date.getDate() + i);
					const formatted = date.toISOString().split("T")[0];

					const res = await axios.get(`${API}/api/bookings/availability/${formatted}`);

					res.data.forEach(r => {
						if (!temp[r.room]) temp[r.room] = [];
						temp[r.room].push({ date: formatted, count: r.count });
					});
				}

				setAvailabilityMap(temp);
			} catch (err) {
				console.error("Availability error:", err);
			}
		};

		fetchAvailability();
	}, []);


	const getAvailabilityStatus = (room) => {
		const data = availabilityMap[room.title] || [];

		let fullyBookedDays = 0;
		let todayAvailable = room.totalRooms;

		data.forEach((d, index) => {
			const booked = d.count;
			const vacant = room.totalRooms - booked;

			if (index === 0) {
				todayAvailable = vacant;
			}

			if (vacant <= 0) {
				fullyBookedDays++;
			}
		});

		if (todayAvailable > 0) {
			return { type: "available", count: todayAvailable };
		}

		if (fullyBookedDays >= 5) {
			return { type: "week" };
		}

		if (fullyBookedDays >= 2) {
			return { type: "days", count: fullyBookedDays };
		}

		return { type: "full" };
	};


	/* ================= HELPERS ================= */
	const getMaxCheckoutDate = () => {
		if (!formData.checkin) return "";
		const d = new Date(formData.checkin);
		d.setDate(d.getDate() + 10);
		return d.toISOString().split("T")[0];
	};

	const handleActivityToggle = (activity) => {
		setSelectedActivities((prev) => {
			if (prev.find((a) => a._id === activity._id)) {
				return prev.filter((a) => a._id !== activity._id);
			} else {
				return [...prev, activity];
			}
		});
	};

	/* ================= INPUT HANDLERS ================= */
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === "name") {
			if (!/^[A-Za-z ]*$/.test(value)) return;
			setFormData({ ...formData, name: value.slice(0, 30) });
			return;
		}

		if (name === "contact") {
			if (!/^[0-9]*$/.test(value)) return;
			setFormData({ ...formData, contact: value.slice(0, 10) });
			return;
		}

		if (name === "age" && (value < 1 || value > 100)) return;

		setFormData({ ...formData, [name]: value });
	};

	const handleMemberChange = (index, e) => {
		const { name, value } = e.target;
		const updated = [...formData.members];

		if (name === "name" && !/^[A-Za-z ]*$/.test(value)) return;
		if (name === "contact" && !/^[0-9]*$/.test(value)) return;
		if (name === "age" && (value < 1 || value > 100)) return;

		updated[index] = { ...updated[index], [name]: value };
		setFormData({ ...formData, members: updated });
	};

	const addMember = () => {
		if (formData.members.length >= 3) {
			alert("Maximum 4 people including main guest");
			return;
		}
		setFormData({
			...formData,
			members: [...formData.members, { name: "", contact: "", gender: "", age: "" }]
		});
	};

	const removeMember = (index) => {
		setFormData({
			...formData,
			members: formData.members.filter((_, i) => i !== index)
		});
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// ✅ File type validation
		const allowedTypes = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/jpg"
		];

		if (!allowedTypes.includes(file.type)) {
			alert("Only PDF and image files are allowed");
			e.target.value = null;
			return;
		}

		// ✅ Size validation (1MB)
		if (file.size > 1024 * 1024) {
			alert("File must be under 1MB");
			e.target.value = null;
			return;
		}

		setFormData({ ...formData, idfile: file });
	};

	/* ================= SUBMIT ================= */
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!selectedRoom) {
			alert("Please select a room");
			return;
		}

		if (formData.checkin < today) {
			alert("Check-in date cannot be past");
			return;
		}

		if (new Date(formData.checkout) <= new Date(formData.checkin)) {
			alert("Check-out must be after check-in");
			return;
		}

		if (!formData.idfile) {
			alert("Upload ID proof");
			return;
		}

		try {
			const data = new FormData();

			data.append("name", formData.name);
			data.append("contact", formData.contact);
			data.append("room", selectedRoom.title);
			data.append("checkin", formData.checkin);
			data.append("checkout", formData.checkout);
			data.append("adult", formData.numAdults);
			data.append("child", formData.numChildren);
			data.append("docFile", formData.idfile);
			data.append("members", JSON.stringify(formData.members));
			data.append("activities", JSON.stringify(selectedActivities.map(a => ({
				activityId: a._id,
				name: a.name,
				price: a.price
			}))));

			const res = await axios.post(`${API}/api/bookings`, data, {
				headers: { "Content-Type": "multipart/form-data" }
			});

			setBookingSuccessData(res.data.booking);

			setFormData({
				name: "",
				contact: "",
				gender: "",
				age: "",
				checkin: "",
				checkout: "",
				numAdults: 1,
				numChildren: 0,
				idfile: null,
				members: []
			});
			setSelectedActivities([]);

			setIsModalOpen(false);

		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || "❌ Booking failed");
		}
	};


	return (
		<>
			<Navbar />

			<div className="booking-page">
				<h1>🛏️ Book Your Stay</h1>

				{loading ? <p>Loading rooms...</p> : (
					<div className="room-list">
						{rooms.map(room => {
							const status = getAvailabilityStatus(room);

							return (
								<div key={room._id} className="room-card">

									<img
										src={room.images?.[0]}
										alt={room.title}
										onClick={() => {
											setSelectedRoom(room);
											setCurrentImageIndex(0);
											setShowImageModal(true);
										}}
									/>

									<h3>{room.title}</h3>
									<p>{room.description}</p>
									<p className="price">₹ {room.price} / night</p>

									{/* 🔥 AVAILABILITY STATUS */}
									<p className={`availability ${status.type}`}>
										{status.type === "available" && `✅ ${status.count} rooms available`}
										{status.type === "days" && `❌ Fully booked for next ${status.count} days`}
										{status.type === "week" && `❌ No rooms available this week`}
										{status.type === "full" && `❌ Fully booked today`}
									</p>

									<button
										disabled={status.type !== "available"}
										onClick={() => {
											setSelectedRoom(room);
											setIsModalOpen(true);
										}}
									>
										{status.type === "available" ? "Book Now" : "Not Available"}
									</button>

								</div>
							);
						})}
					</div>
				)}

				{activities.length > 0 && (
					<>
						<h1 style={{ marginTop: "40px" }}>🎢 Fun & Tourism Activities</h1>
						<div className="room-list">
							{activities.map(act => {
								const isSelected = !!selectedActivities.find(a => a._id === act._id);
								return (
									<div key={act._id} className="room-card">
										<img
											src={act.images?.[0]}
											alt={act.name}
										/>
										<h3>{act.name}</h3>
										<p>{act.description}</p>
										<p>📍 {act.location} | ⏳ {act.duration}</p>
										<p className="price">₹ {act.price}</p>
										<button
											style={{ backgroundColor: isSelected ? "#28a745" : "#0a4d91" }}
											onClick={() => handleActivityToggle(act)}
										>
											{isSelected ? "✅ Added to Stay" : "Add to Stay"}
										</button>
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>

			{/* IMAGE PREVIEW MODAL */}
			{showImageModal && selectedRoom && (
				<div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
					<div className="image-modal" onClick={e => e.stopPropagation()}>
						<h2>{selectedRoom.title}</h2>

						<div className="slider-container">

							{/* PREV BUTTON */}
							<button
								className="nav-btn prev"
								onClick={() =>
									setCurrentImageIndex(prev =>
										prev === 0 ? selectedRoom.images.length - 1 : prev - 1
									)
								}
							>
								❮
							</button>

							{/* MAIN IMAGE */}
							<img
								src={selectedRoom.images[currentImageIndex]}
								alt="room"
								className="main-image"
								onClick={() => setZoomImage(selectedRoom.images[currentImageIndex])}
							/>

							{/* NEXT BUTTON */}
							<button
								className="nav-btn next"
								onClick={() =>
									setCurrentImageIndex(prev =>
										prev === selectedRoom.images.length - 1 ? 0 : prev + 1
									)
								}
							>
								❯
							</button>
						</div>

						{/* THUMBNAILS */}
						<div className="thumbnail-row">
							{selectedRoom.images.map((img, i) => (
								<img
									key={i}
									src={img}
									className={`thumb ${i === currentImageIndex ? "active" : ""}`}
									onClick={() => setCurrentImageIndex(i)}
								/>
							))}
						</div>

						<button className="close-btn" onClick={() => setShowImageModal(false)}>
							Close
						</button>
					</div>
				</div>
			)}

			{zoomImage && (
				<div className="zoom-overlay" onClick={() => setZoomImage(null)}>
					<img src={zoomImage} alt="zoomed" className="zoom-image" />
				</div>
			)}

			{/* BOOKING MODAL */}
			{isModalOpen && selectedRoom && (
				<div className="modal-overlay">
					<div className="modal">
						<h2>Booking: {selectedRoom.title}</h2>

						<form onSubmit={handleSubmit}>

							<input name="name" placeholder="Full Name"
								value={formData.name} onChange={handleInputChange} required />

							<input name="contact" placeholder="Contact No"
								value={formData.contact} onChange={handleInputChange} required />

							<select name="gender" value={formData.gender}
								onChange={handleInputChange} required>
								<option value="">Gender</option>
								<option>Male</option>
								<option>Female</option>
								<option>Other</option>
							</select>

							<input type="number" name="age" placeholder="Age"
								value={formData.age} onChange={handleInputChange} required />

							{/* ✅ CHECK-IN / CHECK-OUT RESTORED */}
							<div className="date-fields">
								<div>
									<label>Check-in</label>
									<input type="date" name="checkin"
										min={today}
										value={formData.checkin}
										onChange={handleInputChange}
										required />
								</div>

								<div>
									<label>Check-out</label>
									<input type="date" name="checkout"
										min={formData.checkin}
										max={getMaxCheckoutDate()}
										value={formData.checkout}
										onChange={handleInputChange}
										required />
								</div>
							</div>

							{/* ADULT / CHILD */}
							<div className="people-count">
								<label>Adults</label>
								<input type="number" name="numAdults" min="1" max="2"
									value={formData.numAdults} onChange={handleInputChange} />

								<label>Children</label>
								<input type="number" name="numChildren" min="0" max="2"
									value={formData.numChildren} onChange={handleInputChange} />
							</div>

							{/* MEMBERS */}
							<div className="members-section">
								{formData.members.map((m, i) => (
									<div key={i} className="member-info">
										<input name="name" placeholder="Name"
											value={m.name} onChange={(e) => handleMemberChange(i, e)} />

										<input name="contact" placeholder="Contact"
											value={m.contact} onChange={(e) => handleMemberChange(i, e)} />

										<select name="gender"
											value={m.gender} onChange={(e) => handleMemberChange(i, e)}>
											<option value="">Gender</option>
											<option>Male</option>
											<option>Female</option>
											<option>Other</option>
										</select>

										<input name="age" placeholder="Age"
											value={m.age} onChange={(e) => handleMemberChange(i, e)} />

										<button type="button" onClick={() => removeMember(i)}>Remove</button>
									</div>
								))}
								<button type="button" className="memBt" onClick={addMember}>
									Add Member
								</button>
							</div>

							{/* ACTIVITIES */}
							{selectedActivities.length > 0 && (
								<div className="activities-section" style={{ background: "#eef", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
									<h3 style={{ margin: "0 0 10px 0" }}>Selected Activities:</h3>
									<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
										{selectedActivities.map(act => (
											<li key={act._id}>✅ {act.name} (+₹{act.price})</li>
										))}
									</ul>
								</div>
							)}

							<input type="file" accept=".jpg,.png,.pdf"
								onChange={handleFileChange} required />

							<button type="submit">Confirm Booking</button>
							<button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
						</form>
					</div>
				</div>
			)}

			{/* SUCCESS MODAL */}
			{bookingSuccessData && (
				<div className="modal-overlay">
					<div className="modal success-modal">
						<h2>🎉 Booking Successful!</h2>
						<p><strong>Booking ID:</strong> {bookingSuccessData._id}</p>
						<p>Your room has been reserved successfully.</p>

						<div style={{ marginTop: "20px", display: "flex", gap: "15px", justifyContent: "center" }}>
							<a
								href={`${API}/api/pdfs/booking/${bookingSuccessData._id}`}
								target="_blank"
								rel="noreferrer"
							>
								<button style={{ background: "#28a745" }}>Download Confirmation PDF</button>
							</a>
							<button onClick={() => setBookingSuccessData(null)}>Close</button>
						</div>
					</div>
				</div>
			)}

			<Footer />
		</>
	);
}
