import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";  // Importing xlsx library
import "./AdminBookings.css";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function AdminBookings() {

	const navigate = useNavigate();

	useEffect(() => {
    	const token = localStorage.getItem("adminToken");
	    if (!token) {
	      navigate("/login"); // redirect if token is missing
	    }
	}, [navigate]);

	const API = process.env.REACT_APP_API_URL;


	const [bookings, setBookings] = useState([]);
	const [previewDoc, setPreviewDoc] = useState(null);
	const [previewType, setPreviewType] = useState(null);
	const [editingId, setEditingId] = useState(null);
	const [rooms, setRooms] = useState([]);
	const [form, setForm] = useState({
		name: "",
		contact: "",
		room: "",
		roomno: "",
		checkin: "",
		checkout: "",
		noOfPersons: 1,
		docFile: null,
	});

	// Fetching the booking data from API
	useEffect(() => {
		const fetchBookings = async () => {
			try {
				const res = await axios.get(`${API}/api/bookings`);
				setBookings(res.data);
			} catch (err) {
				console.error("Error fetching bookings:", err);
			}
		};
		fetchBookings();
	}, []);

	useEffect(() => {
		const fetchRooms = async () => {
			try {
				const res = await axios.get(`${API}/api/rooms`);
				setRooms(res.data);
			} catch (err) {
				console.error("Error fetching rooms:", err);
			}
		};
		fetchRooms();
	}, []);


	// Guest Data

	const [guests, setGuests] = useState([]);

	const [editingGuestId, setEditingGuestId] = useState(null);

	const [guestForm, setGuestForm] = useState({
		bookerName: "",
		bookerContact: "",
		memberName: "",
		memberContact: "",
		memberAge: "",
		memberGender: "",
		roomNo: "",
		checkin: "",
		checkout: "",
	});


	// Fetching all guests

	useEffect(() => {
		const fetchGuests = async () => {
			try {
				const res = await axios.get(`${API}/api/guests`);
				setGuests(res.data);
			} catch (err) {
				console.error("Error fetching guests:", err);
			}
		};
		fetchGuests();
	}, []);


	const getTimeNow = () => new Date().toISOString(); 

const calculateBill = (checkin, checkout, room, noOfPersons) => {
	const checkInDate = new Date(checkin);
	const checkOutDate = new Date(checkout);

	const diffMs = checkOutDate - checkInDate;
	if (isNaN(diffMs) || diffMs <= 0) return 0; // safeguard

	const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
	const roomData = rooms.find(r => r.title === room);
	return days * (roomData?.price || 0) * noOfPersons;
};


	const generateRoomNo = () => {
		const room = rooms.find(r => r.title === form.room);
		if (!room) {
			alert("Select room type first");
			return;
		}

		const conflictingBookings = bookings.filter(b =>
			b.room === form.room &&
			new Date(b.checkin) < new Date(form.checkout) &&
			new Date(b.checkout) > new Date(form.checkin)
		);

		const bookedNumbers = conflictingBookings.map(b => Number(b.roomno));

		const available = room.roomNumbers.find(num => !bookedNumbers.includes(num));

		if (!available) {
			alert("No rooms available!");
			return;
		}

		setForm({ ...form, roomno: available });
	};


	const getAvailableRoomNo = (roomType, checkin, checkout) => {
		const room = rooms.find(r => r.title === roomType);
		if (!room) return null;

		const conflictingBookings = bookings.filter(b =>
			b.room === roomType &&
			new Date(b.checkin) < new Date(checkout) &&
			new Date(b.checkout) > new Date(checkin)
		);

		const bookedNumbers = conflictingBookings.map(b => Number(b.roomno));

		return room.roomNumbers?.find(num => !bookedNumbers.includes(num)) || null;
	};

const updateStatus = async (id, newStatus) => {
	try {
		const booking = bookings.find((b) => b._id === id);
		if (!booking) return;

		const updatedBooking = { ...booking };

		if (newStatus === "Checked In") {
			updatedBooking.status = "Checked In";
			if (!updatedBooking.roomno) updatedBooking.roomno = getAvailableRoomNo(
				booking.room,
				booking.checkin,
				booking.checkout
			);
			updatedBooking.checkInTime = getTimeNow(); // store full ISO string
		}

if (newStatus === "Checked Out") {
	updatedBooking.status = "Checked Out";
	updatedBooking.checkOutTime = new Date().toISOString();

	updatedBooking.totalBill = calculateBill(
		booking.checkin,
		booking.checkout,
		booking.room,
		booking.noOfPersons || 1
	);

	// ✅ find room
	const room = rooms.find(r => r.title === booking.room);

	if (room) {
		const token = localStorage.getItem("adminToken");

		await axios.put(
			`${API}/api/rooms/${room._id}`,
			{
				bookedRooms: Math.max(0, room.bookedRooms - 1)
			},
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);
	}

setRooms(prev =>
	prev.map(r =>
		r._id === room._id
			? { ...r, bookedRooms: Math.max(0, r.bookedRooms - 1) }
			: r
	)
);

}

		await axios.put(`${API}/api/bookings/${id}`, updatedBooking);
		setBookings((prev) =>
			prev.map((b) => (b._id === id ? updatedBooking : b))
		);
		
	} catch (err) {
		console.error("Error updating status:", err);
	}
};

	const handlePreview = (fileUrl, type) => {
		setPreviewType(type);
		// Cloudinary already gives full URL
		setPreviewDoc(fileUrl);
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();

		if (!form.docFile && editingId === null) {
			alert("Please upload a document.");
			return;
		}


		try {
			const data = new FormData();

			data.append("name", form.name);
			data.append("contact", form.contact);
			data.append("room", form.room);
			data.append("roomno", form.roomno);
			data.append("checkin", form.checkin);
			data.append("checkout", form.checkout);
			data.append("noOfPersons", form.noOfPersons);

			// Only append file if selected
			if (form.docFile instanceof File) {
				data.append("docFile", form.docFile);
			}

			if (editingId) {
				await axios.put(`${API}/api/bookings/${editingId}`, data, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				await axios.post(`${API}/api/bookings`, data, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			}

			const res = await axios.get(`${API}/api/bookings`);
			setBookings(res.data);

			setEditingId(null);
			setForm({
				name: "",
				contact: "",
				room: "AC Deluxe Room",
				roomno: "",
				checkin: "",
				checkout: "",
				noOfPersons: 1,
				docFile: null,
			});

		} catch (err) {
			console.error("Error saving booking:", err);
			alert(err.response?.data?.message || "❌ Booking failed");
		}
	};

	const handleEdit = (b) => {
		setForm({
			name: b.name,
			contact: b.contact,
			room: b.room,
			roomno: b.roomno,
			checkin: b.checkin?.split("T")[0] || "",
			checkout: b.checkout?.split("T")[0] || "",
			noOfPersons: b.noOfPersons || 1,
			docFile: null,
		});
		setEditingId(b._id);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this booking?")) {
			try {
				await axios.delete(`${API}/api/bookings/${id}`);
				setBookings((prev) => prev.filter((b) => b._id !== id));
			} catch (err) {
				console.error("Error deleting booking:", err);
			}
		}
	};

	// Download the booking data as an Excel spreadsheet
	const downloadSpreadsheet = () => {
		const ws = XLSX.utils.json_to_sheet(bookings);  // Convert bookings to sheet
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Bookings");

		// Trigger the download of the .xlsx file
		XLSX.writeFile(wb, "bookings_report.xlsx");
	};


	// Guest data handling 
	const handleGuestChange = (e) => {
		setGuestForm({ ...guestForm, [e.target.name]: e.target.value });
	};

	const resetGuestForm = () => {
		setGuestForm({
			bookerName: "",
			bookerContact: "",
			memberName: "",
			memberContact: "",
			memberAge: "",
			memberGender: "",
			roomNo: "",
			checkin: "",
			checkout: "",
		});
		setEditingGuestId(null);
	};

	// Add/Update guest
	const submitGuest = async (e) => {
		e.preventDefault();

		try {
			if (editingGuestId) {
				await axios.put(
					`${API}/api/guests/${editingGuestId}`,
					guestForm
				);
			} else {
				await axios.post(`${API}/api/guests`, guestForm);
			}

			const res = await axios.get(`${API}/api/guests`);
			setGuests(res.data);
			resetGuestForm();
		} catch (err) {
			console.error("Guest save error:", err);
			alert("Failed to save guest");
		}
	};

	// Edit/Delete guest
	const editGuest = (g) => {
		setGuestForm({
			bookerName: g.bookerName,
			bookerContact: g.bookerContact,
			memberName: g.memberName,
			memberContact: g.memberContact,
			memberAge: g.memberAge,
			memberGender: g.memberGender,
			roomNo: g.roomNo,
			checkin: g.checkin?.split("T")[0],
			checkout: g.checkout?.split("T")[0],
		});
		setEditingGuestId(g._id);
	};

	const deleteGuest = async (id) => {
		if (!window.confirm("Delete this guest?")) return;

		try {
			await axios.delete(`${API}/api/guests/${id}`);
			setGuests(guests.filter(g => g._id !== id));
		} catch (err) {
			console.error("Delete guest error:", err);
		}
	};



	return (
		<>
			<AdminNav />
			<div className="admin-bookings">
				<h1>📋 Manage Bookings</h1>

				{/* Download Button */}
				<button onClick={downloadSpreadsheet} className="download-btn">
					Download as Spreadsheet
				</button>

				<div className="secTt">
					<h2 style={{ marginTop: "0px" }}>Add / Edit Booking</h2>
				</div>

				<div className="addBook">
				<form onSubmit={handleFormSubmit} className="booking-form">
					<input
						type="text"
						placeholder="Name"
						value={form.name}
						maxLength={50}
						pattern="[A-Za-z ]{1,50}"
						onChange={(e) => {
							const cleaned = e.target.value.replace(/[^A-Za-z ]/g, "");
							setForm({ ...form, name: cleaned });
						}}
						required
					/>
					<input
						type="tel"
						placeholder="Contact Number"
						pattern="[0-9]{10}" maxLength="10"
						value={form.contact}
						onChange={(e) => {
							const cleaned = e.target.value.replace(/[^0-9]/g, "");
							setForm({ ...form, contact: cleaned }) }
						}
						required
					/>
					<select
						value={form.room}
						onChange={(e) => setForm({ ...form, room: e.target.value })}
					>
						<option value="">Select Room</option>
						{rooms.map((room) => (
							<option key={room._id} value={room.title}>
								{room.title}
							</option>
						))}
					</select>
					<input
						type="number"
						min="1"
						max="4"
						placeholder="Number of Persons"
						value={form.noOfPersons}
						onChange={(e) => {
							const val = e.target.value;
							if ((/^\d+$/.test(val) && +val >= 1 && +val <= 4)) {
								setForm({ ...form, noOfPersons: val === "" ? "" : +val });
							}
							}}
						required
					/>
					<div style={{ display: "flex", gap: "10px" }}>
						<input
							type="number"
							placeholder="Room No (Manual or Auto)"
							value={form.roomno}
							onChange={(e) => setForm({ ...form, roomno: e.target.value })}
						/>

						<button type="button" onClick={generateRoomNo}>
							Auto Assign
						</button>
					</div>
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
						onChange={(e) => setForm({ ...form, checkout: e.target.value })}
						required
					/>
					<input
						type="file"
						accept="application/pdf,image/*"
						onChange={(e) => {
							const file = e.target.files[0];
							if (!file) return;
							if (!["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
								alert("Only PDF and image files are allowed.");
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
					<button type="submit">{editingId ? "Update" : "Add"} Booking</button>
				</form>
				</div>

				<div className="secTt">
					<h2 style={{ marginTop: "20px" }}>Bookers Details</h2>
				</div>

				{/* Table displaying bookings */}
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Contact</th>
							<th>Room</th>
							<th>Room No</th>
							<th>Guests</th>
							<th>Check-in</th>
							<th>Check-out</th>
							<th>Total Bill</th>
							<th>Status</th>
							<th>Document</th>
							<th>Actions</th>
						</tr>
					</thead>
<tbody>
  {bookings.length === 0 ? (
    <tr>
      <td colSpan="13" style={{ textAlign: "center" }}>
        No booking records found
      </td>
    </tr>
  ) : (
    bookings.map((b) => {
      // Parse the check-in/out times
      const checkIn = b.checkInTime ? new Date(b.checkInTime) : null;
      const checkOut = b.checkOutTime ? new Date(b.checkOutTime) : null;

      // Format as "YYYY-MM-DD HH:MM"
const formatDateTime = (iso) => {
	if (!iso) return "-";
	const d = new Date(iso);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};


      return (
        <tr key={b._id}>
          <td>{b.name}</td>
          <td>{b.contact}</td>
          <td>{b.room}</td>
          <td>{b.roomno || "-"}</td>
          <td>{b.noOfPersons}</td>
<td>{formatDateTime(b.checkInTime)}</td>
<td>{formatDateTime(b.checkOutTime)}</td>
          <td>{b.totalBill ? `₹ ${b.totalBill}` : "-"}</td>
          <td>
            <span className={`status ${b.status?.toLowerCase().replace(" ", "-")}`}>
              {b.status}
            </span>
          </td>
          <td>
            {b.docFile && (
              <button onClick={() => handlePreview(b.docFile, b.docType)}>View</button>
            )}
          </td>
          <td>
            {b.status === "Pending" && (
              <button onClick={() => updateStatus(b._id, "Checked In")}>Check In</button>
            )}
            {b.status === "Checked In" && (
              <button onClick={() => updateStatus(b._id, "Checked Out")}>Check Out</button>
            )}
            <button onClick={() => handleEdit(b)}>Edit</button>
            <button onClick={() => handleDelete(b._id)}>Delete</button>
          </td>
        </tr>
      );
    })
  )}
</tbody>
				</table>

				
				<div className="secTt">
					<h2 style={{ marginTop: "20px" }}>Add / Edit Guest</h2>
				</div>
				<div className="addBook">
				<form onSubmit={submitGuest} className="booking-form">
					<input name="bookerName" placeholder="Booker Name" value={guestForm.bookerName} onChange={handleGuestChange} required />
					<input name="bookerContact" placeholder="Booker Contact" value={guestForm.bookerContact} onChange={handleGuestChange} required />
					<input name="memberName" placeholder="Guest Name" value={guestForm.memberName} onChange={handleGuestChange} required />
					<input name="memberContact" placeholder="Guest Contact" value={guestForm.memberContact} onChange={handleGuestChange} />
					<input name="memberAge" type="number" placeholder="Age" value={guestForm.memberAge} onChange={handleGuestChange} required />

					<select name="memberGender" value={guestForm.memberGender} onChange={handleGuestChange} required>
						<option value="">Gender</option>
						<option>Male</option>
						<option>Female</option>
						<option>Other</option>
					</select>

					<input name="roomNo" placeholder="Room No" value={guestForm.roomNo} onChange={handleGuestChange} required />
					<input type="date" name="checkin" value={guestForm.checkin} onChange={handleGuestChange} required />
					<input type="date" name="checkout" value={guestForm.checkout} onChange={handleGuestChange} required />

					<button type="submit">
						{editingGuestId ? "Update Guest" : "Add Guest"}
					</button>

					{editingGuestId && (
						<button type="button" onClick={resetGuestForm}>Cancel</button>
					)}
				</form>
				
				</div>

				<div className="secTt">
					<h2 style={{ marginTop: "20px" }}>Guest Details</h2>
				</div>
				

				<table>
					<thead>
						<tr>
							<th>Booker Name</th>
							<th>Booker Contact</th>
							<th>Guest Name</th>
							<th>Guest Contact</th>
							<th>Age</th>
							<th>Gender</th>
							<th>Room No</th>
							<th>Check-in</th>
							<th>Check-out</th>
							<th>Actions</th>
						</tr>
					</thead>

					<tbody>
						{guests.length === 0 ? (
							<tr>
								<td colSpan="10" style={{ textAlign: "center" }}>
									No guest records found
								</td>
							</tr>
						) : (
							guests.map((g) => (
								<tr key={g._id}>
									<td>{g.bookerName}</td>
									<td>{g.bookerContact}</td>
									<td>{g.memberName}</td>
									<td>{g.memberContact || "-"}</td>
									<td>{g.memberAge}</td>
									<td>{g.memberGender}</td>
									<td>{g.roomNo}</td>
									<td>{g.checkin?.split("T")[0]}</td>
									<td>{g.checkout?.split("T")[0]}</td>
									<td>
										<button onClick={() => editGuest(g)}>Edit</button>
										<button onClick={() => deleteGuest(g._id)}>Delete</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
					



			</div>

			{previewDoc && (
				<div className="preview-overlay" onClick={() => setPreviewDoc(null)}>
					<div className="preview-modal" onClick={(e) => e.stopPropagation()}>
						{previewType === "application/pdf" ? (
							<iframe src={previewDoc} title="Document Preview" width="100%" height="400" />
						) : (
							<img src={previewDoc} alt="Preview" className="preview-image" />
						)}
						<button className="close-btn" onClick={() => setPreviewDoc(null)}>Close</button>
					</div>
				</div>
			)}

			<Footer />
		</>
	);
}