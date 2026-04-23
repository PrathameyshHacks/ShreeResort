import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "./AdminRooms.css";

export default function AdminRooms() {

	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("adminToken");
		if (!token) {
			navigate("/login"); // redirect if token is missing
		}
	}, [navigate]);

	const API = process.env.REACT_APP_API_URL;


	const [rooms, setRooms] = useState([]);
	const [formData, setFormData] = useState({
		id: null,
		title: "",
		category: "",
		price: "",
		images: [], // 🔥 array now
		description: "",
		startRoomNo: "",
		totalRooms: 1,
		bookedRooms: 0,
	});
	const [isEditing, setIsEditing] = useState(false);
	const [fileError, setFileError] = useState("");

	const today = new Date().toISOString().split("T")[0];

	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split("T")[0]
	);

	const [dayBookings, setDayBookings] = useState([]);




	const token = localStorage.getItem("adminToken");

	useEffect(() => {
		fetchRooms();
	}, []);

	const fetchRooms = async () => {
		try {
			const res = await axios.get(`${API}/api/rooms`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setRooms(res.data);
		} catch (err) {
			console.error("Fetch rooms error:", err);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);

		if (files.length > 5) {
			setFileError("Max 5 images allowed");
			return;
		}

		for (let file of files) {
			if (file.size > 5 * 1024 * 1024) {
				setFileError("Each file must be under 5MB");
				return;
			}
		}

		setFileError("");
		setFormData({ ...formData, images: files });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.images.length === 0 && !isEditing) {
			alert("Please upload at least 1 image");
			return;
		}

		try {
			const data = new FormData();

			data.append("title", formData.title);
			data.append("category", formData.category);
			data.append("price", formData.price);
			data.append("description", formData.description);
			data.append("startRoomNo", formData.startRoomNo);
			data.append("totalRooms", formData.totalRooms);
			data.append("bookedRooms", formData.bookedRooms);

			// 🔥 append multiple images
			formData.images.forEach((img) => {
				data.append("images", img);
			});

			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			};

			if (isEditing) {
				await axios.put(`${API}/api/rooms/${formData.id}`, data, config);
			} else {
				await axios.post(`${API}/api/rooms`, data, config);
			}

			setFormData({
				id: null,
				title: "",
				category: "",
				price: "",
				images: [],
				description: "",
				startRoomNo: "",
				totalRooms: 1,
				bookedRooms: 0,
			});

			setIsEditing(false);
			fetchRooms();

		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || "Error saving room");
		}
	};

	const handleEdit = (room) => {
		setFormData({
			id: room._id || null,
			title: room.title || "",
			category: room.category || "",
			price: room.price || "",
			images: [], // important fix
			description: room.description || "",
			totalRooms: room.totalRooms || 1,
			bookedRooms: room.bookedRooms || 0,
			startRoomNo: room.roomNumbers?.[0] || "", // 🔥 important
		});
		setIsEditing(true);
		setFileError("");
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this room?")) {
			try {
				await axios.delete(`${API}/api/rooms/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				fetchRooms();
			} catch (err) {
				console.error("Delete room error:", err);
				alert("Error deleting room");
			}
		}
	};

	const updateTotalRooms = async (id, type) => {
		const room = rooms.find((r) => r._id === id);
		if (!room) return;

		let newTotal =
			type === "inc" ? room.totalRooms + 1 : room.totalRooms - 1;

		// Set minimum to 1 since we handle availability dynamically
		const minRooms = 1;

		// Clamp value between minRooms and 20
		newTotal = Math.min(20, Math.max(minRooms, newTotal));

		// 🚫 Avoid unnecessary API call
		if (newTotal === room.totalRooms) return;

		try {
			const token = localStorage.getItem("Token");
			if (!token) {
				alert("Unauthorized: Please login again");
				return;
			}

			await axios.put(
				`${API}/api/rooms/${id}`,
				{ totalRooms: newTotal }, // 🔥 update only what is needed
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			fetchRooms();
		} catch (err) {
			console.error("Update total rooms error:", err);
			alert(
				err.response?.data?.message ||
				"Failed to update room count"
			);
		}
	};


	// new codes !
	useEffect(() => {
		fetchAvailability();
	}, [selectedDate]);

	const fetchAvailability = async () => {
		try {
			const res = await axios.get(
				`${API}/api/bookings/availability/${selectedDate}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setDayBookings(res.data);
		} catch (err) {
			console.error("Availability fetch error:", err);
		}
	};



	const getBookedCountForRoom = (roomTitle) => {
		const booking = dayBookings.find(b => b.room === roomTitle);
		return booking ? booking.count : 0;
	};


	const changeDateBy = (days) => {
		const date = new Date(selectedDate);
		date.setDate(date.getDate() + days);

		const newDate = date.toISOString().split("T")[0];
		setSelectedDate(newDate);
	};

	return (
		<>
			<AdminNav />
			<div className="admin-rooms">
				<h1>🛏 Manage Rooms & Categories</h1>

				<div className="room-form">
					<h2>{isEditing ? "✏ Edit Room" : "➕ Add New Room"}</h2>
					<form onSubmit={handleSubmit}>
						<input
							type="text"
							name="title"
							placeholder="Room Title"
							value={formData.title}
							onChange={handleInputChange}
							required
						/>
						<select
							name="category"
							value={formData.category}
							onChange={handleInputChange}
							required
						>
							<option value="">Select Category</option>
							<option value="AC">AC</option>
							<option value="Non-AC">Non-AC</option>
							<option value="Family Suite">Family Suite</option>
						</select>
						<input
							type="number"
							name="startRoomNo"
							placeholder="Start Room Number"
							value={formData.startRoomNo}
							onChange={handleInputChange}
							required
						/>
						<input
							type="number"
							name="price"
							placeholder="Price per Night (₹)"
							value={formData.price}
							onChange={handleInputChange}
							required
						/>
						<input
							type="file"
							multiple
							accept="image/*"
							onChange={handleFileChange}
							className="full-width"
						/>
						{fileError && <p style={{ color: "red" }}>{fileError}</p>}
						<textarea
							name="description"
							placeholder="Room Description"
							value={formData.description}
							onChange={handleInputChange}
							required
						/>
						<button type="submit">
							{isEditing ? "Update Room" : "Add Room"}
						</button>
						{isEditing && (
							<button
								type="button"
								className="cancel-btn"
								onClick={() => setIsEditing(false)}
							>
								Cancel
							</button>
						)}
					</form>
				</div>

				<div className="room-list-admin">
					<h2>📋 Existing Rooms</h2>
					<table>
						<thead>
							<tr>
								<th>Title</th>
								<th>Category</th>
								<th>Price</th>
								<th>Total</th>
								<th>Adjust</th>
								<th>Image</th>
								<th>Description</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{rooms.map((r) => (
								<tr key={r._id}>
									<td>{r.title}</td>
									<td>{r.category}</td>
									<td>₹ {r.price}</td>
									<td>{r.totalRooms}</td>
									<td>
										<div className="room-count-controls">
											<button onClick={() => updateTotalRooms(r._id, "inc")}>+</button>
											<button onClick={() => updateTotalRooms(r._id, "dec")}>−</button>
										</div>
									</td>
									<td>
										{r.images.map((img, i) => (
											<img key={i} src={img} alt="room" className="thumb" />
										))}
									</td>
									<td>{r.description}</td>
									<td>
										<button onClick={() => handleEdit(r)} className="edit-btn">Edit</button>
										<button onClick={() => handleDelete(r._id)} className="delete-btn">Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>


				<div className="availability-section">
					<h2>📅 Room Availability</h2>

					<div className="date-picker">
						<label>Select Date: </label>
						<button onClick={() => changeDateBy(-1)} disabled={selectedDate <= today} >−</button>

						<input
							type="date"
							value={selectedDate}
							min={today}
							onChange={(e) => setSelectedDate(e.target.value)}
						/>

						<button onClick={() => changeDateBy(1)}>+</button>
					</div>

					<table>
						<thead>
							<tr>
								<th>Room</th>
								<th>Total Rooms</th>
								<th>Booked</th>
								<th>Vacant</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{rooms.map((room) => {
								const booked = getBookedCountForRoom(room.title);
								const vacant = room.totalRooms - booked;

								return (
									<tr key={room._id}>
										<td>{room.title}</td>
										<td>{room.totalRooms}</td>
										<td className="booked">{booked}</td>
										<td className="vacant">{vacant}</td>
										<td>
											{vacant > 0 ? (
												<span className="vacant">Available</span>
											) : (
												<span className="booked">Full</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>



			</div>
			<Footer />

		</>
	);
}
