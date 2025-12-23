import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminSign.css";

export default function AdminSignUp() {

	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		contact: "",
		password: "",
		passwordValid: {
			length: false,
			uppercase: false,
			lowercase: false,
			number: false,
			special: false,
		},
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "password") {
			const rules = {
				length: value.length >= 8,
				uppercase: /[A-Z]/.test(value),
				lowercase: /[a-z]/.test(value),
				number: /[0-9]/.test(value),
				special: /[^A-Za-z0-9]/.test(value),
			};

			setFormData(prev => ({
				...prev,
				password: value,
				passwordValid: rules,
			}));
			return;
		}

		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const isPasswordStrong = Object.values(formData.passwordValid).every(Boolean);

		if (!formData.name || !formData.email || !formData.contact || !formData.password) {
			alert("Please fill all fields");
			return;
		}

		if (!isPasswordStrong) {
			alert("Password does not meet all requirements");
			return;
		}

		alert("Admin Registered Successfully");
		navigate("/login");
	};

	return (
		<>
			<div className="allP">
				<div className="AdminCont">
					<h1>Admin Registration</h1>

					<form onSubmit={handleSubmit} className="AdForm">
						<input
							type="text"
							name="name"
							placeholder="Administrator Name"
							value={formData.name}
							onChange={handleChange}
							required
						/>

						<input
							type="email"
							name="email"
							placeholder="Administrator Email"
							value={formData.email}
							onChange={handleChange}
							required
						/>

						<input
							type="tel"
							name="contact"
							placeholder="Contact Number"
							value={formData.contact}
							onChange={handleChange}
							required
						/>

						<input
							type="password"
							name="password"
							placeholder="Create Password"
							value={formData.password}
							onChange={handleChange}
							required
						/>

						<ul className="password-requirements">
							<li style={{ color: formData.passwordValid.length ? "green" : "red" }}>
								At least 8 characters long
							</li>
							<li style={{ color: formData.passwordValid.uppercase ? "green" : "red" }}>
								At least 1 uppercase letter
							</li>
							<li style={{ color: formData.passwordValid.lowercase ? "green" : "red" }}>
								At least 1 lowercase letter
							</li>
							<li style={{ color: formData.passwordValid.number ? "green" : "red" }}>
								At least 1 number
							</li>
							<li style={{ color: formData.passwordValid.special ? "green" : "red" }}>
								At least 1 special character
							</li>
						</ul>

						<button type="submit">Sign Up</button>
					</form>

					<p style={{ textAlign: "center" }}>
						Already have an account?{" "}
						<Link to="/login" className="adLl">Login</Link>
					</p>
				</div>
			</div>
		</>
	);
}
