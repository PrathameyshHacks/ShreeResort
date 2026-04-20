	import React, { useEffect, useState } from "react";
	import axios from "axios";
	import AdminNav from "../components/AdminNav";
	import Footer from "../components/Footer";
	import { useNavigate } from "react-router-dom";

	export default function AdminProfile() {

		const navigate = useNavigate();
		const API = process.env.REACT_APP_API_URL;

		const [admin, setAdmin] = useState({
			name: "",
			email: "",
			password: ""
		});

		const token = localStorage.getItem("adminToken");

		// 🔐 Protect route
		useEffect(() => {
			if (!token) {
				navigate("/login");
			}
		}, [navigate, token]);

		// 📥 Fetch admin details
		useEffect(() => {
			fetchAdmin();
		}, []);

		const fetchAdmin = async () => {
			try {
				const res = await axios.get(`${API}/api/admin/profile`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				setAdmin({
					name: res.data.name,
					email: res.data.email,
					password: ""
				});
			} catch (err) {
				console.error("Fetch admin error:", err);
			}
		};

		const handleChange = (e) => {
			setAdmin({ ...admin, [e.target.name]: e.target.value });
		};

		// 💾 Update profile
		const handleSubmit = async (e) => {
			e.preventDefault();

			try {
				await axios.put(`${API}/api/admin/profile`, admin, {
					headers: { Authorization: `Bearer ${token}` }
				});

				alert("✅ Profile updated successfully");
				fetchAdmin();

			} catch (err) {
				console.error(err);
				alert("❌ Failed to update profile");
			}
		};

		return (
			<>
				<AdminNav />

				<div className="admin-profile">
					<h1>👤 Admin Profile</h1>

					<form onSubmit={handleSubmit} className="profile-form">

						<input
							type="text"
							name="name"
							placeholder="Name"
							value={admin.name}
							onChange={handleChange}
							required
						/>

						<input
							type="email"
							name="email"
							placeholder="Email"
							value={admin.email}
							onChange={handleChange}
							required
						/>

						<input
							type="password"
							name="password"
							placeholder="New Password (optional)"
							value={admin.password}
							onChange={handleChange}
						/>

						<button type="submit">Update Profile</button>

					</form>
				</div>

				<Footer />

				<style>{`
					.admin-profile {
						padding: 40px;
						background: #f4f9ff;
						min-height: 80vh;
						text-align: center;
					}

					.profile-form {
						max-width: 400px;
						margin: auto;
						display: flex;
						flex-direction: column;
						gap: 15px;
						background: white;
						padding: 20px;
						border-radius: 8px;
						box-shadow: 0 2px 10px rgba(0,0,0,0.1);
					}

					.profile-form input {
						padding: 10px;
						border: 1px solid #ccc;
						border-radius: 5px;
					}

					.profile-form button {
						background: #0a4d91;
						color: white;
						padding: 10px;
						border: none;
						border-radius: 5px;
						cursor: pointer;
					}

					.profile-form button:hover {
						background: #083b70;
					}
				`}</style>
			</>
		);
	}