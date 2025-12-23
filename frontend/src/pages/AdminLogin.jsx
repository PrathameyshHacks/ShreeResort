import React, { useState } from "react";
import { Link ,useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	const navigate = useNavigate();

	const handleLogin = (e) => {
		e.preventDefault();

		// TEMP CHECK (replace with backend later)
		if (email === "admin@moryalodge.com" && password === "admin123") {
			
			alert("Admin Logged In Successfully");
			navigate("/admin");
		} else {
			alert("Invalid credentials");
		}
	};

	return (
		<div className="admin-login-container">
			<form className="admin-login-box" onSubmit={handleLogin}>
				<h1>Admin Login</h1>

				<input
					type="email"
					placeholder="Admin Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<div className="login-options">
					<label>
						<input
							type="checkbox"
							checked={rememberMe}
							onChange={() => setRememberMe(!rememberMe)}
						/>
						Remember me
					</label>

					<Link to="/admin/forgot-password" className="forgot-link">
						Forgot password?
					</Link>
				</div>

				<button type="submit">Login</button>

				<p className="signup-text">
					Not an admin?{" "}
					<Link to="/signin" className="adLn">Sign in here</Link>
				</p>
			</form>
		</div>
	);
}
