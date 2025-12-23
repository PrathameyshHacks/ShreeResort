import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import LandingPage from "./pages/Home";
import BookingPage from "./pages/booking";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminRooms from "./pages/AdminRooms";
import AdminReports from "./pages/AdminReports";
import TouristPage from "./pages/tourist";
import AboutPage from "./components/AboutPage";
import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSign";

export default function App() {
	return (
		<Router>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/booking" element={<BookingPage />} />
        		<Route path="/about" element={<AboutPage />} />
				<Route path="/admin" element={<AdminDashboard />} />
				<Route path="/admin/bookings" element={<AdminBookings />} />
				<Route path="/admin/rooms" element={<AdminRooms />} />
				<Route path="/admin/reports" element={<AdminReports />} />
				<Route path="/tourist" element={<TouristPage />} />
				<Route path="/login" element={<AdminLogin/>}/>
				<Route path="/signin" element={<AdminSignUp/>}/>
			</Routes>
		</Router>
	);
}