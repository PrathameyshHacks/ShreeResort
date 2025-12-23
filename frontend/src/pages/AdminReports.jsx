import React from "react";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";
import "./AdminReports.css";

export default function AdminReports() {
	const transactions = [
		{
			id: 1,
			guest: "Sahil Gogavle",
			room: "AC Deluxe",
			roomNo: 203,
			date: "2025-09-10",
			totalBill: "₹5,000",
			payBy: "Online",
		},
		{
			id: 2,
			guest: "Prathamesh Acharekar",
			room: "Family Suite",
			roomNo: 3,
			date: "2025-09-12",
			totalBill: "₹3,200",
			payBy: "Cash",
		},
		{
			id: 3,
			guest: "Yash More",
			room: "Non-AC Standard",
			roomNo: 108,
			date: "2025-09-14",
			totalBill: "₹4,500",
			payBy: "Online",
		},
	];

	const reviews = [
		{
			id: 1,
			name: "Sahil Gogavle",
			text: "Excellent stay! Very clean rooms and friendly staff.",
		},
		{
			id: 2,
			name: "Prathamesh Acharekar",
			text: "Good experience overall. Food quality can improve.",
		},
		{
			id: 3,
			name: "Yash More",
			text: "Comfortable rooms but parking space is limited.",
		},
	];

	return (
		<>
			<AdminNav />

			<div className="admin-reports">
				<h1>📊 Transactions Report</h1>

				{/* TRANSACTION TABLE */}
				<div className="table-wrapper">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Guest Name</th>
								<th>Room</th>
								<th>Room No</th>
								<th>Date</th>
								<th>Total Bill</th>
								<th>Pay By</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((t) => (
								<tr key={t.id}>
									<td>{t.id}</td>
									<td>{t.guest}</td>
									<td>{t.room}</td>
									<td>{t.roomNo}</td>
									<td>{t.date}</td>
									<td>{t.totalBill}</td>
									<td>
										<span className={`pay ${t.payBy.toLowerCase()}`}>
											{t.payBy}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* REVIEWS & SUGGESTIONS */}
				<div className="reviews-section">
					<h2>📝 Reviews & Suggestions</h2>

					<div className="reviews-list">
						{reviews.map((r) => (
							<div key={r.id} className="review-card">
								<h4>{r.name}</h4>
								<p>{r.text}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
}
