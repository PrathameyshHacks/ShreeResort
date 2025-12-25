import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";
import * as XLSX from "xlsx"; // For Excel export
import { useNavigate } from "react-router-dom";
import "./AdminReports.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminReports() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;


  // Authentication check
  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Dummy reviews
  const reviews = [
    { id: 1, name: "Sahil Gogavle", text: "Excellent stay! Very clean rooms and friendly staff." },
    { id: 2, name: "Prathamesh Acharekar", text: "Good experience overall. Food quality can improve." },
    { id: 3, name: "Yash More", text: "Comfortable rooms but parking space is limited." },
  ];

  // Fetch bookings
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API}/api/bookings`);
        const sortedTrans = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sortedTrans);
        setFilteredTransactions(sortedTrans);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  // Filter handlers
  const handleMonthFilterChange = (e) => {
    const month = e.target.value;
    setMonthFilter(month);
    applyFilters(roomFilter, statusFilter, month);
  };

  const handleRoomFilterChange = (e) => {
    const room = e.target.value;
    setRoomFilter(room);
    applyFilters(room, statusFilter, monthFilter);
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    applyFilters(roomFilter, status, monthFilter);
  };

  const applyFilters = (room, status, month) => {
    let filtered = [...transactions];
    if (room) filtered = filtered.filter((t) => t.room === room);
    if (status) filtered = filtered.filter((t) => t.status === status);
    if (month !== "") filtered = filtered.filter(
      (t) => new Date(t.checkin).getMonth() === parseInt(month, 10)
    );
    setFilteredTransactions(filtered);
  };

  // Excel download
  const downloadSpreadsheet = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTransactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions_report.xlsx");
  };

  // Dashboard data
  const totalBookings = transactions.length;
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalBill || 0), 0);
  const roomsOccupiedToday = transactions.filter(
    (t) =>
      new Date(t.checkin) <= new Date() &&
      new Date(t.checkout) >= new Date()
  ).length;

  // Chart data
  const roomTypes = ["AC Deluxe Room", "Non-AC Standard Room", "Family Suite"];
  const bookingsPerRoom = roomTypes.map(
    (r) => transactions.filter((t) => t.room === r).length
  );
  const chartData = {
    labels: roomTypes,
    datasets: [
      {
        label: "Bookings",
        data: bookingsPerRoom,
        backgroundColor: ["#0a4d91", "#17a2b8", "#28a745"],
      },
    ],
  };

  return (
    <>
      <AdminNav />

      <div className="admin-reports">
        <h1>📊 Transactions Report</h1>

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="card">
            <h3>Total Bookings</h3>
            <p>{totalBookings}</p>
          </div>
          <div className="card">
            <h3>Total Revenue</h3>
            <p>₹ {totalRevenue}</p>
          </div>
          <div className="card">
            <h3>Occupied Rooms Today</h3>
            <p>{roomsOccupiedToday}</p>
          </div>
        </div>

        {/* Filters and Download */}
        <div className="tblOpt">
          <div className="filter-section">
            <label>Month:</label>
            <select value={monthFilter} onChange={handleMonthFilterChange}>
              <option value="">All</option>
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>

            <label style={{ marginLeft: "20px" }}>Room:</label>
            <select value={roomFilter} onChange={handleRoomFilterChange}>
              <option value="">All</option>
              {roomTypes.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <label style={{ marginLeft: "20px" }}>Status:</label>
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
            </select>
          </div>

          <button onClick={downloadSpreadsheet} className="download-btn">
            Download as Spreadsheet
          </button>
        </div>

        {/* Transaction Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Room No</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Bill</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, index) => (
                <tr key={t._id}>
                  <td>{index + 1}</td>
                  <td>{t.name}</td>
                  <td>{t.room}</td>
                  <td>{t.roomno || "-"}</td>
                  <td>{t.checkin?.split("T")[0]}</td>
                  <td>{t.checkout?.split("T")[0]}</td>
                  <td>{t.totalBill ? `₹ ${t.totalBill}` : "-"}</td>
                  <td>{t.status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className="chart-section">
          <h2>Bookings per Room Type</h2>
          <Bar data={chartData} />
        </div>

        {/* Reviews */}
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
