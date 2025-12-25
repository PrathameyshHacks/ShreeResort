import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import "./Booking.css";

export default function BookingPage() {

	const today = new Date().toISOString().split("T")[0];

	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);

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
				const res = await axios.get("http://localhost:5000/api/rooms");
				const updated = res.data.map(r => ({
					...r,
					image: `http://localhost:5000${r.image}`
				}));
				setRooms(updated);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchRooms();
	}, []);

	/* ================= HELPERS ================= */
	const getMaxCheckoutDate = () => {
		if (!formData.checkin) return "";
		const d = new Date(formData.checkin);
		d.setDate(d.getDate() + 10);
		return d.toISOString().split("T")[0];
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

		// Send members as JSON string
		data.append("members", JSON.stringify(formData.members));

		await axios.post(
			"http://localhost:5000/api/bookings",
			data,
			{ headers: { "Content-Type": "multipart/form-data" } }
		);

		alert(`✅ Booking Confirmed for ${selectedRoom.title}`);

		// Reset form
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
						{rooms.map(room => (
							<div key={room._id} className="room-card">
								<img
									src={room.image}
									alt={room.title}
									onClick={() => {
										setSelectedRoom(room);
										setShowImageModal(true);
									}}
								/>
								<h3>{room.title}</h3>
								<p>{room.description}</p>
								<p className="price">₹ {room.price} / night</p>
								<button onClick={() => {
									setSelectedRoom(room);
									setIsModalOpen(true);
								}}>
									Book Now
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{/* IMAGE PREVIEW MODAL */}
			{showImageModal && selectedRoom && (
				<div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
					<div className="image-modal" onClick={e => e.stopPropagation()}>
						<h2>{selectedRoom.title}</h2>
						<img src={selectedRoom.image} alt="Preview" />
						<button className="close-btn" onClick={() => setShowImageModal(false)}>
							Close
						</button>
					</div>
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

							<input type="file" accept=".jpg,.png,.pdf"
								onChange={handleFileChange} required />

							<button type="submit">Confirm Booking</button>
							<button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
						</form>
					</div>
				</div>
			)}

			<Footer />
		</>
	);
}