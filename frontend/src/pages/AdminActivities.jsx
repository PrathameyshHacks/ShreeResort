import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNav from "../components/AdminNav";
import "./AdminRooms.css";

export default function AdminActivities() {
	const API = "http://localhost:5000";

	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(false);

	const [showModal, setShowModal] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);

	const [form, setForm] = useState({
		name: "",
		price: "",
		duration: "",
		location: "",
		description: "",
		images: []
	});

	useEffect(() => {
		fetchActivities();
	}, []);

	const fetchActivities = async () => {
		setLoading(true);
		try {
			const res = await axios.get(`${API}/api/activities`);
			setActivities(res.data);
		} catch (err) {
			console.error(err);
		}
		setLoading(false);
	};

	const openAddModal = () => {
		setForm({ name: "", price: "", duration: "", location: "", description: "", images: [] });
		setIsEditing(false);
		setEditId(null);
		setShowModal(true);
	};

	const openEditModal = (act) => {
		setForm({
			name: act.name,
			price: act.price,
			duration: act.duration,
			location: act.location,
			description: act.description,
			images: []
		});
		setIsEditing(true);
		setEditId(act._id);
		setShowModal(true);
	};

	const handleImageChange = (e) => {
		setForm({ ...form, images: [...e.target.files] });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("name", form.name);
		formData.append("price", form.price);
		formData.append("duration", form.duration);
		formData.append("location", form.location);
		formData.append("description", form.description);
		form.images.forEach(img => formData.append("images", img));

		const token = localStorage.getItem("adminToken");
		if (!token) return alert("Please login first");

		const config = { headers: { Authorization: `Bearer ${token}` } };

		try {
			if (isEditing) {
				await axios.put(`${API}/api/activities/${editId}`, formData, config);
				alert("Activity updated");
			} else {
				await axios.post(`${API}/api/activities`, formData, config);
				alert("Activity added");
			}
			setShowModal(false);
			fetchActivities();
		} catch (err) {
			alert(err.response?.data?.message || "Failed to save");
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this activity?")) return;

		const token = localStorage.getItem("adminToken");
		if (!token) return alert("Please login first");

		try {
			await axios.delete(`${API}/api/activities/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			fetchActivities();
		} catch (err) {
			alert("Failed to delete");
		}
	};

	return (
		<>
			<AdminNav />
			<div className="admin-rooms">
				<h1>🎢 Manage Tourism Activities</h1>

				<div className="room-form">
					<h2>{isEditing ? "✏ Edit Activity" : "➕ Add New Activity"}</h2>
					<form onSubmit={handleSubmit}>
						<input
							type="text"
							name="name"
							placeholder="Activity Name"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							required
						/>
						<input
							type="number"
							name="price"
							placeholder="Price (₹)"
							value={form.price}
							onChange={(e) => setForm({ ...form, price: e.target.value })}
							required
						/>
						<input
							type="text"
							name="duration"
							placeholder="Duration (e.g., 2 Hours)"
							value={form.duration}
							onChange={(e) => setForm({ ...form, duration: e.target.value })}
							required
						/>
						<input
							type="text"
							name="location"
							placeholder="Location"
							value={form.location}
							onChange={(e) => setForm({ ...form, location: e.target.value })}
							required
						/>
						<input
							type="file"
							multiple
							accept="image/*"
							onChange={handleImageChange}
							className="full-width"
						/>
						<textarea
							name="description"
							placeholder="Activity Description"
							value={form.description}
							onChange={(e) => setForm({ ...form, description: e.target.value })}
							required
						/>
						<button type="submit">
							{isEditing ? "Update Activity" : "Add Activity"}
						</button>
						{isEditing && (
							<button
								type="button"
								className="cancel-btn"
								onClick={() => { setIsEditing(false); setForm({ name: "", price: "", duration: "", location: "", description: "", images: [] }); }}
							>
								Cancel
							</button>
						)}
					</form>
				</div>

				{loading ? <p>Loading activities...</p> : (
					<div className="room-list-admin">
						<h2>📋 Existing Activities</h2>
						<table>
							<thead>
								<tr>
									<th>Image</th>
									<th>Name</th>
									<th>Location</th>
									<th>Duration</th>
									<th>Price (₹)</th>
									<th>Description</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{activities.map(act => (
									<tr key={act._id}>
										<td>
											{act.images && act.images.map((img, i) => (
												<img key={i} src={img} alt="activity" className="thumb" />
											))}
										</td>
										<td>{act.name}</td>
										<td>{act.location}</td>
										<td>{act.duration}</td>
										<td>₹{act.price}</td>
										<td>{act.description}</td>
										<td>
											<button className="edit-btn" onClick={() => openEditModal(act)}>Edit</button>
											<button className="delete-btn" onClick={() => handleDelete(act._id)}>Delete</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

		</>
	);
}
