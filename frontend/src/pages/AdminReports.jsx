import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminNav from "../components/AdminNav";
import Footer from "../components/Footer";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "./AdminReports.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminReports() {
  const [transactions, setTransactions] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, reviewsRes] = await Promise.all([
          axios.get(`${API}/api/bookings`),
          axios.get(`${API}/api/reviews`)
        ]);
        
        const sortedTrans = bookingsRes.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setTransactions(sortedTrans);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      }
    };
    fetchData();
  }, [API]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      if (roomFilter && t.room !== roomFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      
      const tDate = new Date(t.checkin || t.createdAt);
      if (startDate && tDate < new Date(startDate)) return false;
      
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // inclusive of end date
        if (tDate >= end) return false;
      }
      return true;
    });
  }, [transactions, roomFilter, statusFilter, startDate, endDate]);

  // --- KPIs ---
  const kpis = useMemo(() => {
    const totalRev = filteredData.reduce((sum, t) => sum + (t.totalBill || 0), 0);
    const extraCharges = filteredData.reduce((sum, t) => sum + (t.billSummary?.extraChargesTotal || 0), 0);
    
    return {
      totalBookings: filteredData.length,
      revenue: totalRev,
      avgBill: filteredData.length ? Math.round(totalRev / filteredData.length) : 0,
      extraCharges
    };
  }, [filteredData]);

  // --- Revenue Over Time (Line Chart) ---
  const revenueChartData = useMemo(() => {
    const groups = {};
    filteredData.forEach(t => {
      if (!t.totalBill) return;
      const date = new Date(t.checkin || t.createdAt).toISOString().split('T')[0];
      groups[date] = (groups[date] || 0) + t.totalBill;
    });
    
    const sortedDates = Object.keys(groups).sort();
    
    return {
      labels: sortedDates,
      datasets: [{
        label: 'Daily Revenue (₹)',
        data: sortedDates.map(d => groups[d]),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }, [filteredData]);

  // --- Booking Status Distribution (Pie Chart) ---
  const statusData = useMemo(() => {
    const counts = { "Pending": 0, "Checked In": 0, "Checked Out": 0, "Cancelled": 0 };
    filteredData.forEach(t => {
      if (counts[t.status] !== undefined) counts[t.status]++;
      else counts[t.status] = 1;
    });
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
      }]
    };
  }, [filteredData]);

  // --- Room Popularity & Revenue (Bar Chart) ---
  const roomData = useMemo(() => {
    const stats = {};
    filteredData.forEach(t => {
      if (!stats[t.room]) stats[t.room] = { count: 0, revenue: 0 };
      stats[t.room].count++;
      stats[t.room].revenue += (t.billSummary?.roomTotal || t.totalBill || 0); // Try to get pure room rev if possible
    });
    
    const labels = Object.keys(stats);
    return {
      labels,
      datasets: [
        {
          label: 'Bookings',
          data: labels.map(l => stats[l].count),
          backgroundColor: '#3b82f6',
          yAxisID: 'y'
        },
        {
          label: 'Room Revenue (₹)',
          data: labels.map(l => stats[l].revenue),
          backgroundColor: '#10b981',
          yAxisID: 'y1'
        }
      ],
      stats
    };
  }, [filteredData]);

  // --- Activity Popularity (Bar Chart) ---
  const activityData = useMemo(() => {
    const stats = {};
    filteredData.forEach(t => {
      if (t.billActivities && t.billActivities.length > 0) {
        t.billActivities.forEach(a => {
           if (!stats[a.name]) stats[a.name] = { count: 0, revenue: 0 };
           stats[a.name].count += (a.persons || 1);
           stats[a.name].revenue += (a.total || 0);
        });
      } else if (t.activities && t.activities.length > 0) {
        t.activities.forEach(a => {
           if (!stats[a.name]) stats[a.name] = { count: 0, revenue: 0 };
           stats[a.name].count++;
           stats[a.name].revenue += (a.price || 0);
        });
      }
    });
    
    const labels = Object.keys(stats);
    return {
      labels,
      datasets: [
        {
          label: 'Total Participants',
          data: labels.map(l => stats[l].count),
          backgroundColor: '#8b5cf6'
        }
      ],
      stats
    };
  }, [filteredData]);

  // --- Revenue Breakdown (Doughnut) ---
  const revenueBreakdown = useMemo(() => {
    let rooms = 0, activities = 0, extra = 0;
    filteredData.forEach(t => {
      rooms += (t.billSummary?.roomTotal || 0);
      activities += (t.billSummary?.activityTotal || 0);
      extra += (t.billSummary?.extraChargesTotal || 0);
    });
    
    // If old bookings don't have billSummary, fallback to entire total as rooms
    if (rooms === 0 && activities === 0 && extra === 0) {
        rooms = filteredData.reduce((sum, t) => sum + (t.totalBill || 0), 0);
    }

    return {
      labels: ['Rooms', 'Activities', 'Extra Charges'],
      datasets: [{
        data: [rooms, activities, extra],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b']
      }]
    };
  }, [filteredData]);

  // --- Review & Ratings (Bar) ---
  const ratingsData = useMemo(() => {
    const stats = {};
    reviews.forEach(r => {
      const name = r.type === 'room' ? r.roomName : (r.activityName || r.type);
      if (!stats[name]) stats[name] = { sum: 0, count: 0 };
      stats[name].sum += r.rating;
      stats[name].count++;
    });
    
    const labels = Object.keys(stats);
    return {
      labels,
      datasets: [{
        label: 'Average Rating (out of 5)',
        data: labels.map(l => (stats[l].sum / stats[l].count).toFixed(1)),
        backgroundColor: '#f5a623'
      }],
      stats
    };
  }, [reviews]);

  // --- Advanced Insights ---
  const insights = useMemo(() => {
    let topRoom = { name: "-", rev: 0 };
    Object.entries(roomData.stats || {}).forEach(([name, data]) => {
      if (data.revenue > topRoom.rev) topRoom = { name, rev: data.revenue };
    });

    let topAct = { name: "-", count: 0 };
    Object.entries(activityData.stats || {}).forEach(([name, data]) => {
      if (data.count > topAct.count) topAct = { name, count: data.count };
    });

    let topRated = { name: "-", rating: 0 };
    Object.entries(ratingsData.stats || {}).forEach(([name, data]) => {
      const avg = data.sum / data.count;
      if (avg > topRated.rating && data.count >= 1) topRated = { name, rating: avg };
    });

    const months = {};
    filteredData.forEach(t => {
      const date = t.checkin || t.createdAt;
      if(!date) return;
      const m = new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' });
      months[m] = (months[m] || 0) + 1;
    });
    let peakMonth = { name: "-", count: 0 };
    Object.entries(months).forEach(([name, count]) => {
      if (count > peakMonth.count) peakMonth = { name, count };
    });

    return { topRoom, topAct, topRated, peakMonth };
  }, [roomData, activityData, ratingsData, filteredData]);

  // Options
  const barOptionsDouble = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Bookings' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Revenue (₹)' } },
    },
  };
  
  const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const getUniqueRooms = () => {
    const rooms = new Set();
    transactions.forEach(t => rooms.add(t.room));
    return Array.from(rooms).filter(Boolean);
  };

  const downloadSpreadsheet = () => {
    const wsData = filteredData.map(t => ({
        ID: t._id,
        Guest: t.name,
        Contact: t.contact,
        Room: t.room,
        RoomNo: t.roomno,
        CheckIn: t.checkin ? t.checkin.split("T")[0] : "",
        CheckOut: t.checkout ? t.checkout.split("T")[0] : "",
        TotalBill: t.totalBill || 0,
        Status: t.status
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Shree_Moraya_Analytics.xlsx");
  };

  return (
    <>
      <AdminNav />

      <div className="admin-reports">
        <h1>📊 Analytics Dashboard</h1>

        {/* FILTERS */}
        <div className="dashboard-filters">
          <div className="filter-group">
            <label>Start Date:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>End Date:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Room:</label>
            <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)}>
              <option value="">All Rooms</option>
              {getUniqueRooms().map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button className="download-btn" onClick={downloadSpreadsheet}>
            ⬇️ Export Excel
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="dashboard-cards">
          <div className="card revenue">
            <h3>Total Revenue</h3>
            <p>₹ {kpis.revenue.toLocaleString()}</p>
          </div>
          <div className="card bookings">
            <h3>Total Bookings</h3>
            <p>{kpis.totalBookings}</p>
          </div>
          <div className="card avg-bill">
            <h3>Avg Bill Value</h3>
            <p>₹ {kpis.avgBill.toLocaleString()}</p>
          </div>
          <div className="card extra">
            <h3>Extra Charges Collected</h3>
            <p>₹ {kpis.extraCharges.toLocaleString()}</p>
          </div>
        </div>

        {/* INSIGHTS */}
        <h2 className="section-heading">💡 Business Insights</h2>
        <div className="insights-grid">
          <div className="insight-card profit">
            <div className="insight-icon">💰</div>
            <div className="insight-content">
              <h4>Most Profitable Room</h4>
              <p>{insights.topRoom.name}</p>
            </div>
          </div>
          <div className="insight-card fire">
            <div className="insight-icon">🔥</div>
            <div className="insight-content">
              <h4>Most Popular Activity</h4>
              <p>{insights.topAct.name}</p>
            </div>
          </div>
          <div className="insight-card star">
            <div className="insight-icon">⭐</div>
            <div className="insight-content">
              <h4>Highest Rated Service</h4>
              <p>{insights.topRated.name} ({insights.topRated.rating.toFixed(1)})</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Peak Booking Month</h4>
              <p>{insights.peakMonth.name}</p>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <h2 className="section-heading">📈 Performance Charts</h2>
        <div className="charts-grid">
          <div className="chart-wrapper full-width">
            <h3>Revenue Over Time</h3>
            <div className="chart-container">
              <Line data={revenueChartData} options={defaultChartOptions} />
            </div>
          </div>

          <div className="chart-wrapper">
            <h3>Booking Status Distribution</h3>
            <div className="chart-container">
              <Pie data={statusData} options={defaultChartOptions} />
            </div>
          </div>

          <div className="chart-wrapper">
            <h3>Revenue Breakdown</h3>
            <div className="chart-container">
              <Doughnut data={revenueBreakdown} options={defaultChartOptions} />
            </div>
          </div>

          <div className="chart-wrapper full-width">
            <h3>Room Popularity & Revenue</h3>
            <div className="chart-container">
              <Bar data={roomData} options={barOptionsDouble} />
            </div>
          </div>

          <div className="chart-wrapper">
            <h3>Activity Participation</h3>
            <div className="chart-container">
              <Bar data={activityData} options={defaultChartOptions} />
            </div>
          </div>

          <div className="chart-wrapper">
            <h3>Average Ratings</h3>
            <div className="chart-container">
              <Bar data={ratingsData} options={{...defaultChartOptions, scales: { y: { min: 0, max: 5 } }}} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <h2 className="section-heading">🧾 Detailed Transactions</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Room No</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Bill</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((t) => (
                <tr key={t._id}>
                  <td><strong>{t.name}</strong><br/><span style={{color: '#64748b', fontSize: '12px'}}>{t.contact}</span></td>
                  <td>{t.room}</td>
                  <td>{t.roomno || "-"}</td>
                  <td>{t.checkin ? t.checkin.split("T")[0] : "-"}</td>
                  <td>{t.checkout ? t.checkout.split("T")[0] : "-"}</td>
                  <td><strong>{t.totalBill ? `₹ ${t.totalBill.toLocaleString()}` : "-"}</strong></td>
                  <td>
                    <span className={`status-badge ${t.status?.toLowerCase().replace(' ', '.') || 'pending'}`}>
                      {t.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{textAlign: "center", padding: "30px", color: "#64748b"}}>
                    No transactions found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
      <Footer />
    </>
  );
}
