import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "./Booking.css";

import ac from "../images/room.jpg";
import noac from "../images/ac.jpg";
import hall from "../images/nonac.jpg";
import Footer from "../components/Footer";

export default function BookingPage() {

	/* ================= VALIDATION HELPERS ================= */
	const today = new Date().toISOString().split("T")[0];

	const [selectedRoom, setSelectedRoom] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		contact: "",
		email: "",
		checkin: "",
		checkout: "",
		idfile: null,
		numAdults: 1,
		numChildren: 0,
		members: [{ name: "", gender: "", age: "" }],
	});

	const rooms = [
		{
			id: 1,
			title: "Non-AC Standard Room",
			price: 800,
			images: [ac, noac, hall],
			description: "Cozy room with all basic amenities for a comfortable stay.",
		},
		{
			id: 2,
			title: "AC Deluxe Room",
			price: 1200,
			images: [noac, hall, ac],
			description: "Spacious AC room with modern interiors & wifi enabled.",
		},
		{
			id: 3,
			title: "Family Suite",
			price: 1800,
			images: [hall, ac, noac],
			description: "Perfect for families with extra space and comfort.",
		},
	];

	/* ================= HANDLERS ================= */

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		// Name → only alphabets & space, max 30
		if (name === "name") {
			if (!/^[A-Za-z ]*$/.test(value)) return;

			setFormData({
				...formData,
				[name]: value.slice(0, 30),
			});
			return;
		}

		// Contact → only numbers, max 10 digits
		if (name === "contact") {
			if (!/^[0-9]*$/.test(value)) return;

			setFormData({
				...formData,
				[name]: value.slice(0, 10),
			});
			return;
		}

		// Default update
		setFormData({
			...formData,
			[name]: value,
		});
	};


	const handleMemberChange = (index, e) => {
		const updatedMembers = [...formData.members];
		const { name, value } = e.target;

		if (name === "age" && (value < 1 || value > 100)) {
			return;
		}

		updatedMembers[index][name] = value;
		setFormData({ ...formData, members: updatedMembers });
	};

	const addMember = () => {
		if (formData.members.length >= 4) {
			alert("Maximum 4 members allowed per room");
			return;
		}
		setFormData({
			...formData,
			members: [...formData.members, { name: "", gender: "", age: "" }],
		});
	};

	const removeMember = (index) => {
		const updated = formData.members.filter((_, i) => i !== index);
		setFormData({ ...formData, members: updated });
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const maxSize = 1024 * 1024; // 1MB
		if (file.size > maxSize) {
			alert("File size must be less than 1MB");
			e.target.value = null;
			return;
		}
		setFormData({ ...formData, idfile: file });
	};

	const openModal = (room) => {
		setSelectedRoom(room);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedRoom(null);
	};

	const openImagePreview = (room) => {
		setSelectedRoom(room);
		setShowImageModal(true);
	};

	const closeImagePreview = () => {
		setShowImageModal(false);
		setSelectedRoom(null);
	};


	const getMaxCheckoutDate = () => {
		if (!formData.checkin) return "";
		const d = new Date(formData.checkin);
		d.setDate(d.getDate() + 10);
		return d.toISOString().split("T")[0];
	};


	/* ================= SUBMIT ================= */

	const handleSubmit = (e) => {
		e.preventDefault();

		if (formData.checkin < today) {
			alert("Check-in date cannot be in the past");
			return;
		}

		if (new Date(formData.checkout) <= new Date(formData.checkin)) {
			alert("Check-out date must be after check-in date");
			return;
		}

		if (!formData.idfile) {
			alert("Please upload ID proof");
			return;
		}

		alert(`✅ Booking Confirmed for ${selectedRoom.title}`);

		setFormData({
			name: "",
			contact: "",
			email: "",
			checkin: "",
			checkout: "",
			idfile: null,
			numAdults: 1,
			numChildren: 0,
			members: [{ name: "", gender: "", age: "" }],
		});

		closeModal();
	};

	return (
		<>
			<Navbar />
			<div className="booking-page">
				<h1>🛏️ Book Your Stay</h1>

				<div className="room-list">
					{rooms.map((room) => (
						<div key={room.id} className="room-card">
							<img
								src={room.images[0]}
								alt={room.title}
								onClick={() => openImagePreview(room)}
								style={{ cursor: "pointer" }}
							/>
							<h3>{room.title}</h3>
							<p>{room.description}</p>
							<p className="price">₹ {room.price} / night</p>
							<button onClick={() => openModal(room)}>Book Now</button>
						</div>
					))}
				</div>

				

				{/* IMAGE PREVIEW MODAL */}
				{showImageModal && selectedRoom && (
					<div className="image-modal-overlay" onClick={closeImagePreview}>
						<div className="image-modal" onClick={(e) => e.stopPropagation()}>
							<h2>{selectedRoom.title}</h2>
							<div className="image-gallery">
								{selectedRoom.images.map((img, i) => (
									<img key={i} src={img} alt="room" />
								))}
							</div>
							<button onClick={closeImagePreview} className="close-btn">Close</button>
						</div>
					</div>
				)}

				

				{/* BOOKING MODAL */}
				{isModalOpen && selectedRoom && (
					<div className="modal-overlay">
						<div className="modal">
							<h2>Booking: {selectedRoom.title}</h2>

							<form onSubmit={handleSubmit}>
								<input type="text" name="name" placeholder="Full Name" value={formData.name} pattern="[A-Za-z ]{1,50}" onChange={handleInputChange} required />

								<input type="tel" name="contact" placeholder="Contact No" value={formData.contact} pattern="[0-9]{10}" maxLength="10" onChange={handleInputChange} required/>

								<input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />

								<div className="date-fields">
									<div>
										<label>Check-in</label>
										<input type="date" name="checkin" min={today} value={formData.checkin} onChange={handleInputChange} required />
									</div>
									<div>
										<label>Check-out</label>
										<input type="date" name="checkout" min={formData.checkin} max={getMaxCheckoutDate()} value={formData.checkout} onChange={handleInputChange} required />
									</div>
								</div>

								<div className="people-count">
									<label>Adults</label>
									<input type="number" name="numAdults" min="1" max="2" value={formData.numAdults} onChange={handleInputChange} />
									<label>Children</label>
									<input type="number" name="numChildren" min="0" max="2" value={formData.numChildren} onChange={handleInputChange} />
								</div>

								<div className="members-section">
									{formData.members.map((m, i) => (
										<div key={i} className="member-info">
											<input type="text" name="name" placeholder="Name" value={m.name} pattern="[A-Za-z ]{1,50}"  onChange={(e) => handleMemberChange(i, e)} required />
											<select name="gender" value={m.gender} onChange={(e) => handleMemberChange(i, e)} required>
												<option value="">Gender</option>
												<option>Male</option>
												<option>Female</option>
												<option>Other</option>
											</select>
											<input type="number" name="age" placeholder="Age" min="1" max="100" value={m.age} onChange={(e) => handleMemberChange(i, e)} required />
											{formData.members.length > 1 && (
												<button type="button" onClick={() => removeMember(i)}>Remove</button>
											)}
										</div>
									))}
									<button type="button" className="memBt"onClick={addMember}>Add Member</button>
								</div>

								<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} required />

								<button type="submit" className="confirm-btn">Confirm Booking</button>
								<button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
							</form>
						</div>
					</div>
				)}

				
			</div>

			<Footer/>
      
	</>
	);
}
