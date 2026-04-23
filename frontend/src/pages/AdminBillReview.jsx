// AdminBillReview.jsx
import React, { useState } from "react";
import axios from "axios";

export default function AdminBillReview({ booking, rooms, onClose, onFinalized }) {
	const API = process.env.REACT_APP_API_URL;

	/* ─── Room price lookup ─── */
	const roomData = rooms.find(r => r.title === booking.room);
	const defaultRoomPricePerNight = roomData?.price || 0;

	/* ─── Editable Stay Bill ─── */
	const checkInDate = new Date(booking.actualCheckIn || booking.checkin);
	const checkOutNow = new Date();
	const defaultNights = Math.max(1, Math.ceil((checkOutNow - checkInDate) / (1000 * 60 * 60 * 24)));

	const [stayNights, setStayNights]          = useState(() =>
		(booking.billSummary?.roomTotal && defaultRoomPricePerNight > 0)
			? Math.round(booking.billSummary.roomTotal / defaultRoomPricePerNight)
			: defaultNights
	);
	const [roomPricePerNight, setRoomPricePerNight] = useState(defaultRoomPricePerNight);

	/* ─── Activity Bill ─── */
	const [billActivities, setBillActivities] = useState(() => {
		if (booking.billActivities?.length > 0) return booking.billActivities;
		return (booking.activities || []).map(a => ({
			name: a.name || "",
			pricePerPerson: a.price || 0,
			persons: 1,
			total: a.price || 0,
		}));
	});

	/* ─── Extra Charges ─── */
	const [extraCharges, setExtraCharges] = useState(
		booking.extraCharges?.length > 0
			? booking.extraCharges
			: [{ chargeType: "", amount: 0 }]
	);

	const [saving, setSaving] = useState(false);

	/* ─── Computed totals ─── */
	const roomTotal      = Number(stayNights) * Number(roomPricePerNight);
	const activityTotal  = billActivities.reduce((s, a) => s + (Number(a.total) || 0), 0);
	const extraTotal     = extraCharges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
	const grandTotal     = roomTotal + activityTotal + extraTotal;

	/* ─── Activity helpers ─── */
	const updateActivity = (i, field, value) => {
		const updated = [...billActivities];
		updated[i] = { ...updated[i], [field]: value };
		const ppp  = Number(field === "pricePerPerson" ? value : updated[i].pricePerPerson);
		const pers = Number(field === "persons"        ? value : updated[i].persons);
		updated[i].total = ppp * pers;
		setBillActivities(updated);
	};

	const addActivity    = () =>
		setBillActivities([...billActivities, { name: "", pricePerPerson: 0, persons: 1, total: 0 }]);

	const removeActivity = i =>
		setBillActivities(billActivities.filter((_, idx) => idx !== i));

	/* ─── Extra charge helpers ─── */
	const updateCharge = (i, field, value) => {
		const updated = [...extraCharges];
		updated[i] = { ...updated[i], [field]: value };
		setExtraCharges(updated);
	};

	const addCharge    = () =>
		setExtraCharges([...extraCharges, { chargeType: "", amount: 0 }]);

	const removeCharge = i =>
		setExtraCharges(extraCharges.filter((_, idx) => idx !== i));

	/* ─── Finalize ─── */
	const handleFinalize = async () => {
		for (const a of billActivities) {
			if (!a.name.trim()) { alert("Activity name cannot be empty."); return; }
		}
		for (const c of extraCharges) {
			if (!c.chargeType.trim() && Number(c.amount) > 0) {
				alert("Please enter a charge type for all extra charges."); return;
			}
		}

		const payload = {
			billActivities: billActivities.filter(a => a.name.trim()),
			extraCharges:   extraCharges.filter(c => c.chargeType.trim()),
			billSummary: {
				roomTotal,
				activityTotal,
				extraChargesTotal: extraTotal,
				grandTotal,
			},
		};

		setSaving(true);
		try {
			const res = await axios.put(`${API}/api/bookings/${booking._id}/finalize`, payload);
			onFinalized(res.data.booking);
		} catch (err) {
			alert(err.response?.data?.message || "Finalization failed");
		}
		setSaving(false);
	};

	return (
		<div className="bill-review-overlay">
			<div className="bill-review-modal">
				<h2>🧾 Bill Review — {booking.name}</h2>
				<button className="bill-review-close" onClick={onClose}>✕</button>

				{/* ── Customer Info ── */}
				<section className="bill-section">
					<h3 className="bill-section-title">Customer & Stay Details</h3>
					<table className="bill-info-table">
						<tbody>
							<tr><td className="label">Booking ID</td><td>{booking._id}</td></tr>
							<tr><td className="label">Name</td><td>{booking.name}</td></tr>
							<tr><td className="label">Contact</td><td>{booking.contact}</td></tr>
							<tr><td className="label">Room</td><td>{booking.room} (No. {booking.roomno})</td></tr>
							<tr><td className="label">Guests</td><td>{booking.noOfPersons}</td></tr>
							<tr><td className="label">Check-in</td><td>{new Date(booking.actualCheckIn || booking.checkin).toLocaleDateString()}</td></tr>
						</tbody>
					</table>
				</section>

				{/* ── Sec A: Stay Bill (Editable) ── */}
				<section className="bill-section">
					<h3 className="bill-section-title">Sec A — Stay Bill</h3>
					<table className="bill-table">
						<thead>
							<tr>
								<th>Room</th>
								<th>Nights</th>
								<th>Price / Night (₹)</th>
								<th>Sec A Total (₹)</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>{booking.room}</td>
								<td>
									<input
										type="number"
										min="1"
										value={stayNights}
										onChange={e => setStayNights(e.target.value)}
									/>
								</td>
								<td>
									<input
										type="number"
										min="0"
										value={roomPricePerNight}
										onChange={e => setRoomPricePerNight(e.target.value)}
									/>
								</td>
								<td style={{ fontWeight: "bold" }}>₹ {roomTotal}</td>
							</tr>
						</tbody>
					</table>
				</section>

				{/* ── Sec B: Activity Bill ── */}
				<section className="bill-section">
					<h3 className="bill-section-title">Sec B — Activity Bill</h3>
					<table className="bill-table">
						<thead>
							<tr>
								<th>Activity Name</th>
								<th>Price / Person (₹)</th>
								<th>Persons</th>
								<th>Sec B Total (₹)</th>
								<th>Remove</th>
							</tr>
						</thead>
						<tbody>
							{billActivities.map((act, i) => (
								<tr key={i}>
									<td>
										<input value={act.name}
											onChange={e => updateActivity(i, "name", e.target.value)}
											placeholder="e.g. Fishing" />
									</td>
									<td>
										<input type="number" min="0"
											value={act.pricePerPerson}
											onChange={e => updateActivity(i, "pricePerPerson", e.target.value)} />
									</td>
									<td>
										<input type="number" min="1"
											value={act.persons}
											onChange={e => updateActivity(i, "persons", e.target.value)} />
									</td>
									<td style={{ fontWeight: "bold" }}>₹ {act.total || 0}</td>
									<td>
										<button className="bill-remove-btn" onClick={() => removeActivity(i)}>✕</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<button className="bill-add-btn" onClick={addActivity}>+ Add Activity</button>
					<div className="bill-subtotal">Sec B Subtotal: <strong>₹ {activityTotal}</strong></div>
				</section>

				{/* ── Sec C: Extra Charges ── */}
				<section className="bill-section">
					<h3 className="bill-section-title">Sec C — Extra Charges</h3>
					<table className="bill-table">
						<thead>
							<tr>
								<th>Charge Type</th>
								<th>Amount (₹)</th>
								<th>Remove</th>
							</tr>
						</thead>
						<tbody>
							{extraCharges.map((c, i) => (
								<tr key={i}>
									<td>
										<input value={c.chargeType}
											onChange={e => updateCharge(i, "chargeType", e.target.value)}
											placeholder="e.g. Food, Extra Bed, Damage" />
									</td>
									<td>
										<input type="number" min="0"
											value={c.amount}
											onChange={e => updateCharge(i, "amount", e.target.value)} />
									</td>
									<td>
										<button className="bill-remove-btn" onClick={() => removeCharge(i)}>✕</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<button className="bill-add-btn" onClick={addCharge}>+ Add Charge</button>
					<div className="bill-subtotal">Sec C Subtotal: <strong>₹ {extraTotal}</strong></div>
				</section>

				{/* ── Grand Total Box ── */}
				<div className="bill-total-box">
					<div className="bill-total-row"><span>Sec A — Stay Bill</span>       <span>₹ {roomTotal}</span></div>
					<div className="bill-total-row"><span>Sec B — Activity Bill</span>   <span>₹ {activityTotal}</span></div>
					<div className="bill-total-row"><span>Sec C — Extra Charges</span>   <span>₹ {extraTotal}</span></div>
					<div className="bill-grand-total-row"><span>GRAND TOTAL = A + B + C</span><span>₹ {grandTotal}</span></div>
				</div>

				{/* ── Actions ── */}
				<div className="bill-actions">
					<button className="cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
					<button className="finalize-btn" onClick={handleFinalize} disabled={saving}>
						{saving ? "Saving..." : "✅ Finalize Bill & Check Out"}
					</button>
				</div>
			</div>
		</div>
	);
}
