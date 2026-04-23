import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNav from "../components/AdminNav";

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

			<style>{`
				.admin-rooms {
					padding: 30px;
					font-family: Arial, sans-serif;
					background: #fdffe0ff;
					min-height: 100vh;
				}
				.admin-rooms h1 {
					text-align: center;
					color: #0a4d91;
					margin-bottom: 25px;
				}
				.room-form {
					background: #f8f8f8;
					padding: 20px;
					border-radius: 8px;
					max-width: 600px;
					margin: 0 auto 30px;
					box-shadow: 0 2px 10px rgba(0,0,0,0.1);
				}
				.room-form h2 {
					color: #0a4d91;
					text-align: center;
					margin-bottom: 15px;
				}
				.room-form form {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}

				.room-list-admin {
					background: #f4f9ff;
					padding: 20px;
					border-radius: 8px;
					overflow-x: auto;
				}
				.room-form input,
				.room-form select,
				.room-form textarea {
					padding: 8px;
					border: 1px solid #ccc;
					border-radius: 4px;
				}
				.room-form button {
					background: #0a4d91;
					color: white;
					border: none;
					padding: 8px;
					border-radius: 4px;
					cursor: pointer;
				}
				.room-form button:hover {
					background: #083b70;
				}
				.cancel-btn {
					background: #888 !important;
				}
				table {
					width: 100%;
					border-collapse: collapse;
				}
				th, td {
					border: 1px solid #ddd;
					padding: 8px;
					text-align: center;
				}
				th {
					background: #0a4d91;
					color: white;
				}
				.thumb {
					width: 80px;
					height: 60px;
					object-fit: cover;
					margin-right: 5px;
				}
				.edit-btn { background: #ffc107; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-right: 5px; }
				.delete-btn { background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; }
			`}</style>
		</>
	);
}
