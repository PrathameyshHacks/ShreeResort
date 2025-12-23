import React, { useState } from "react";
import "./AdminBookings.css";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";

export default function AdminBookings() {
	const roomPrices = {
		"AC Deluxe Room": 1200,
		"Non-AC Standard Room": 800,
		"Family Suite": 1800,
	};

	const roomRanges = {
		"AC Deluxe Room": [201, 215],
		"Non-AC Standard Room": [101, 115],
		"Family Suite": [1, 5],
	};

	const [bookings, setBookings] = useState([]);
	const [previewDoc, setPreviewDoc] = useState(null);
	const [previewType, setPreviewType] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState({
		name: "",
		email: "",
		room: "AC Deluxe Room",
		checkin: "",
		checkout: "",
		docFile: null,
		docPreview: "",
	});

	const getTimeNow = () =>
		new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

	const calculateBill = (checkin, checkout, room) => {
		const days = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
		return days * (roomPrices[room] || 0);
	};

	const getAvailableRoomNo = (roomType) => {
		const [start, end] = roomRanges[roomType];
		const usedRooms = bookings
			.filter((b) => b.room === roomType && b.roomNo)
			.map((b) => b.roomNo);

		for (let i = start; i <= end; i++) {
			if (!usedRooms.includes(i)) return i;
		}
		return null;
	};

	const updateStatus = (id, newStatus) => {
		setBookings((prev) =>
			prev.map((b) => {
				if (b.id !== id) return b;

				if (newStatus === "Checked In") {
					return {
						...b,
						status: "Checked In",
						roomNo: getAvailableRoomNo(b.room),
						checkInTime: getTimeNow(),
					};
				}

				if (newStatus === "Checked Out") {
					return {
						...b,
						status: "Checked Out",
						checkOutTime: getTimeNow(),
						totalBill: calculateBill(b.checkin, b.checkout, b.room),
					};
				}

				return b;
			})
		);
	};

	const handlePreview = (fileOrUrl, type) => {
		setPreviewType(type); // 'application/pdf' or 'image'
		setPreviewDoc(fileOrUrl);
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();

		if (!form.docFile && editingId === null) {
			alert("Please upload a document.");
			return;
		}

		const docPreview = form.docFile ? URL.createObjectURL(form.docFile) : form.docPreview;
		const docType = form.docFile ? form.docFile.type : previewType;

		if (editingId !== null) {
			if (window.confirm("Are you sure you want to update this record?")) {
				setBookings((prev) =>
				prev.map((b) =>
					b.id === editingId ? { ...form, id: editingId, docPreview, docType } : b
				)
			);
			setEditingId(null);
			}
		} else {
			setBookings((prev) => [
				...prev,
				{
					...form,
					id: prev.length ? prev[prev.length - 1].id + 1 : 1,
					status: "Pending",
					roomNo: null,
					checkInTime: null,
					checkOutTime: null,
					totalBill: null,
					docPreview,
					docType,
				},
			]);
		}

		setForm({
			name: "",
			email: "",
			room: "AC Deluxe Room",
			checkin: "",
			checkout: "",
			docFile: null,
			docPreview: "",
		});
	};

	const handleEdit = (b) => {
		setForm({ ...b, docFile: null });
		setEditingId(b.id);
	};

	const handleDelete = (id) => {
		if (window.confirm("Are you sure you want to delete this room?")) {
			setBookings((prev) => prev.filter((b) => b.id !== id));
		}
	};

	const downloadCSV = () => {
		const headers = [
			"ID",
			"Name",
			"Email",
			"Room",
			"Room No",
			"Check-in",
			"Check-out",
			"Check-In Time",
			"Check-Out Time",
			"Total Bill",
			"Status",
		];
		const rows = bookings.map((b) => [
			b.id,
			b.name,
			b.email,
			b.room,
			b.roomNo ?? "",
			b.checkin,
			b.checkout,
			b.checkInTime ?? "",
			b.checkOutTime ?? "",
			b.totalBill ?? "",
			b.status,
		]);
		let csvContent =
			"data:text/csv;charset=utf-8," +
			[headers, ...rows].map((e) => e.join(",")).join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "bookings.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<>
			<AdminNav/>
			<div className="admin-bookings">
				<h1>📋 Manage Bookings</h1>

				<button onClick={downloadCSV} className="download-btn">
					Download CSV
				</button>

				<form onSubmit={handleFormSubmit} className="booking-form">
					<input
						type="text"
						placeholder="Name"
						value={form.name}
						maxLength={50}
						pattern="[A-Za-z ]{1,50}"
						onChange={(e) => {
							const cleaned = e.target.value.replace(/[^A-Za-z ]/g, "");
						
							setForm({
								...form,
								name: cleaned
							});
						}}
						required
					/>
					
					<input
						type="email"
						placeholder="Email"
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
						required
					/>
					<select
						value={form.room}
						onChange={(e) => setForm({ ...form, room: e.target.value })}
					>
						{Object.keys(roomPrices).map((r) => (
							<option key={r}>{r}</option>
						))}
					</select>
					<input
						type="date"
						value={form.checkin}
						onChange={(e) => setForm({ ...form, checkin: e.target.value })}
						min={new Date().toISOString().split("T")[0]}
						required
					/>
					<input
						type="date"
						value={form.checkout}
						min={form.checkin || new Date().toISOString().split("T")[0]}
						onChange={(e) =>
							setForm({ ...form, checkout: e.target.value })
						}
						required
					/>	
					<input
						type="file"
						accept="application/pdf,image/*"
						onChange={(e) => {
							const file = e.target.files[0];
							if (!file) return;

							if (!["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
								alert("Only PDF and image files (jpg, jpeg, png) are allowed.");
								e.target.value = null;
								return;
							}

							if (file.size > 1024 * 1024) {
								alert("File size must be 1 MB or less.");
								e.target.value = null;
								return;
							}

							setForm({ ...form, docFile: file });
						}}
						{...(editingId === null ? { required: true } : {})}
					/>
					<button type="submit">{editingId !== null ? "Update" : "Add"} Booking</button>
				</form>

				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Name</th>
							<th>Email</th>
							<th>Room</th>
							<th>Room No</th>
							<th>Check-in</th>
							<th>Check-out</th>
							<th>Check-In Time</th>
							<th>Check-Out Time</th>
							<th>Total Bill (₹)</th>
							<th>Status</th>
							<th>Document</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{bookings.map((b) => (
							<tr key={b.id}>
								<td>{b.id}</td>
								<td>{b.name}</td>
								<td>{b.email}</td>
								<td>{b.room}</td>
								<td>{b.roomNo ?? "-"}</td>
								<td>{b.checkin}</td>
								<td>{b.checkout}</td>
								<td>{b.checkInTime ?? "-"}</td>
								<td>{b.checkOutTime ?? "-"}</td>
								<td>{b.totalBill ? `₹ ${b.totalBill}` : "-"}</td>
								<td>
									<span className={`status ${b.status.toLowerCase().replace(" ", "-")}`}>
										{b.status}
									</span>
								</td>
								<td>
									{b.docPreview && (
										<button
											onClick={() =>
												handlePreview(
													b.docPreview,
													b.docType
												)
											}
										>
											View
										</button>
									)}
								</td>
								<td>
									{b.status === "Pending" && (
										<button
											onClick={() => updateStatus(b.id, "Checked In")}
											className="checkin-btn"
										>
											Check In
										</button>
									)}
									{b.status === "Checked In" && (
										<button
											onClick={() => updateStatus(b.id, "Checked Out")}
											className="checkout-btn"
										>
											Check Out
										</button>
									)}
									<button onClick={() => handleEdit(b)} className="edit-btn">
										Edit
									</button>
									<button onClick={() => handleDelete(b.id)} className="delete-btn">
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{previewDoc && (
				<div className="preview-overlay" onClick={() => setPreviewDoc(null)}>
					<div className="preview-modal" onClick={(e) => e.stopPropagation()}>
						{previewType === "application/pdf" ? (
							<iframe
								src={previewDoc}
								title="Document Preview"
								width="100%"
								height="400"
							/>
						) : (
							<img src={previewDoc} alt="Preview" className="preview-image" />
						)}
						<button className="close-btn" onClick={() => setPreviewDoc(null)}>
							Close
						</button>
					</div>
				</div>
			)}
			
			<Footer/>
		</>
	);
}
