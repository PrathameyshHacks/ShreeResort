import React, { useState } from "react";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";

export default function AdminRooms() {
	const [rooms, setRooms] = useState([
		{
			id: 1,
			title: "Non-AC Standard Room",
			category: "Non-AC",
			price: 800,
			image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
			description: "Cozy room with all basic amenities.",
			totalRooms: 15,
			bookedRooms: 0,
		},
		{
			id: 2,
			title: "AC Deluxe Room",
			category: "AC",
			price: 1200,
			image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461",
			description: "Spacious AC room with sea view.",
			totalRooms: 15,
			bookedRooms: 0,
		},
	]);

	const [formData, setFormData] = useState({
		id: null,
		title: "",
		category: "",
		price: "",
		image: "",
		description: "",
		totalRooms: 1,
		bookedRooms: 0,
	});

	const [isEditing, setIsEditing] = useState(false);

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (isEditing) {
			setRooms(rooms.map(r => (r.id === formData.id ? formData : r)));
			setIsEditing(false);
		} else {
			setRooms([...rooms, { ...formData, id: Date.now() }]);
		}

		setFormData({
			id: null,
			title: "",
			category: "",
			price: "",
			image: "",
			description: "",
			totalRooms: 1,
			bookedRooms: 0,
		});
	};

	const handleEdit = (room) => {
		setFormData(room);
		setIsEditing(true);
	};

	const handleDelete = (id) => {
		if (window.confirm("Are you sure you want to delete this room?")) {
			setRooms(rooms.filter(r => r.id !== id));
		}
	};

	const updateTotalRooms = (id, type) => {
		setRooms(prev =>
			prev.map(room => {
				if (room.id !== id) return room;

				let newTotal =
					type === "inc"
						? room.totalRooms + 1
						: room.totalRooms - 1;

				// minimum = max(bookedRooms, 1)
				const minRooms = Math.max(room.bookedRooms, 1);

				// clamp between min and 20
				newTotal = Math.min(20, Math.max(minRooms, newTotal));

				return { ...room, totalRooms: newTotal };
			})
		);
	};


	return (
		<>
			<AdminNav/>
			<div className="admin-rooms">
				
				<h1>🛏 Manage Rooms & Categories</h1>

				<div className="room-form">
					<h2>{isEditing ? "✏ Edit Room" : "➕ Add New Room"}</h2>
					<form onSubmit={handleSubmit}>
						<input type="text" name="title" placeholder="Room Title" value={formData.title} onChange={handleInputChange} required />

						<select name="category" value={formData.category} onChange={handleInputChange} required>
							<option value="">Select Category</option>
							<option value="AC">AC</option>
							<option value="Non-AC">Non-AC</option>
							<option value="Family Suite">Family Suite</option>
						</select>

						<input type="number" name="price" placeholder="Price per Night (₹)" value={formData.price} onChange={handleInputChange} required />
						<input type="text" name="image" placeholder="Image URL" value={formData.image} onChange={handleInputChange} required />
						<textarea name="description" placeholder="Room Description" value={formData.description} onChange={handleInputChange} required />

						<button type="submit">{isEditing ? "Update Room" : "Add Room"}</button>
						{isEditing && (
							<button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
						)}
					</form>
				</div>

				<div className="room-list-admin">
					<h2>📋 Existing Rooms</h2>
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Title</th>
								<th>Category</th>
								<th>Price</th>
								<th>Total</th>
								<th>Booked</th>
								<th>Vacant</th>
								<th>Adjust</th>
								<th>Image</th>
								<th>Description</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{rooms.map(r => (
								<tr key={r.id}>
									<td>{r.id}</td>
									<td>{r.title}</td>
									<td>{r.category}</td>
									<td>₹ {r.price}</td>
									<td>{r.totalRooms}</td>
									<td className="booked">{r.bookedRooms}</td>
									<td className="vacant">{r.totalRooms - r.bookedRooms}</td>
									<td>
										<div className="room-count-controls">
											<button onClick={() => updateTotalRooms(r.id, "inc")}>+</button>
											<button onClick={() => updateTotalRooms(r.id, "dec")}>−</button>
										</div>
									</td>
									<td><img src={r.image} alt={r.title} className="thumb" /></td>
									<td>{r.description}</td>
									<td>
										<button onClick={() => handleEdit(r)} className="edit-btn">Edit</button>
										<button onClick={() => handleDelete(r.id)} className="delete-btn">Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			<Footer/>

			<style>{`
				/* ===== EXISTING CSS (UNCHANGED) ===== */
				.admin-rooms {
					padding: 30px;
					font-family: Arial, sans-serif;
					background: #fdffe0ff;
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
				.room-form input,
				.room-form select,
				.room-form textarea {
					padding: 8px;
					border: 1px solid #ccc;
					border-radius: 4px;
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
				}
				.edit-btn { background: #ffc107; }
				.delete-btn { background: #dc3545; }

				/* ===== NEW CSS (ADDED ONLY) ===== */
				.room-count-controls {
					display: flex;
					justify-content: center;
					gap: 6px;
				}
				.room-count-controls button {
					background: #0a4d91;
					color: white;
					border: none;
					padding: 4px 8px;
					border-radius: 4px;
					cursor: pointer;
				}
				.room-count-controls button:hover {
					background: #083b70;
				}
				.booked {
					color: red;
					font-weight: bold;
				}
				.vacant {
					color: green;
					font-weight: bold;
				}
			`}</style>
		</>
	);
}
