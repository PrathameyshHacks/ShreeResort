//pdfs.js
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

const LEFT_MARGIN = 70;

// ================= HEADER =================
const generateHeader = (doc) => {
	doc.rect(0, 0, doc.page.width, 110).fill("#fff9c4");

	doc.fillColor("red")
		.fontSize(22)
		.font("Helvetica-Bold")
		.text("SHREE MORAYA LODGE", 0, 25, { align: "center" });

	doc.fillColor("black")
		.fontSize(11)
		.font("Helvetica")
		.moveDown(0.5)
		.text("Address: Near Toll Naka, Ganapatipule, PIN - 415 615", { align: "center" })
		.text("Dist. Ratnagiri [ Maharashtra ] Contact - +91 88883 72061", { align: "center" });

	doc.moveDown(2);
	doc.y = 120;
};

// ================= FOOTER =================
const addFooter = (doc) => {
	doc.moveDown(3);
	doc.font("Helvetica-Oblique")
		.fontSize(12)
		.text("Thanks for visiting !", { align: "center" });
};

// ================= DATE =================
const formatDate = (date) => {
	return date ? new Date(date).toISOString().split("T")[0] : "N/A";
};

// ================= STAY CALC =================
const calculateStay = (checkIn, checkOut, roomPrice = 0) => {
	const start = new Date(checkIn);
	const end = new Date(checkOut);

	let diff = end - start;

	let nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

	// ✅ FIX: minimum 1 night
	if (nights <= 0) nights = 1;

	return {
		nights,
		total: nights * roomPrice,
	};
};

// ================= TABLE =================
const drawTable = (doc, startY, columns, rows) => {
	const colWidths = [250, 120, 120];
	let y = startY;
	let startX = LEFT_MARGIN;

	let x = startX;
	doc.font("Helvetica-Bold");

	columns.forEach((col, i) => {
		doc.rect(x, y, colWidths[i], 25).stroke();
		doc.text(col, x + 5, y + 8, { width: colWidths[i] });
		x += colWidths[i];
	});

	y += 25;
	doc.font("Helvetica");

	rows.forEach((row) => {
		let x = startX;

		row.forEach((cell, i) => {
			doc.rect(x, y, colWidths[i], 25).stroke();
			doc.text(cell, x + 5, y + 8, {
				width: colWidths[i],
				align: i === 0 ? "left" : "center",
			});
			x += colWidths[i];
		});

		y += 25;
	});

	return y;
};

// =====================================================
// 1. BOOKING PDF
// =====================================================
router.get("/booking/:id", async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ message: "Booking not found" });

		const doc = new PDFDocument({ margin: 50 });
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename=Booking_${booking._id}.pdf`);
		doc.pipe(res);

		generateHeader(doc);

		doc.fontSize(18).font("Helvetica-Bold")
			.text("Booking Confirmation", { align: "center" }).moveDown();

		doc.font("Helvetica").fontSize(12);

		doc.text(`Booking ID: ${booking._id}`, LEFT_MARGIN);
		doc.text(`Customer Name: ${booking.name}`, LEFT_MARGIN);
		doc.text(`Contact: ${booking.contact}`, LEFT_MARGIN);
		doc.moveDown();

		doc.text(`Room: ${booking.room}`, LEFT_MARGIN);
		doc.text(`Room No: ${booking.roomno || "To be assigned"}`, LEFT_MARGIN);
		doc.text(`Check-in: ${formatDate(booking.checkin)}`, LEFT_MARGIN);
		doc.text(`Check-out: ${formatDate(booking.checkout)}`, LEFT_MARGIN);
		doc.text(`Status : ${booking.status}`, LEFT_MARGIN);
		doc.moveDown();

		const roomDoc = await Room.findOne({ title: booking.room });
		const roomPrice = roomDoc?.price || 0;
		const { nights, total } = calculateStay(booking.checkin, booking.checkout, roomPrice);

		let rows = [];
		let activitiesTotal = 0;

		rows.push([
			`Room (${booking.room})`,
			`${nights} night(s) × ₹${roomPrice}`,
			`₹ ${total}`,
		]);

		if (booking.activities?.length > 0) {
			booking.activities.forEach((act) => {
				rows.push([act.name, "-", `₹ ${act.price}`]);
				activitiesTotal += act.price;
			});
		}

		rows.push(["TOTAL", "", `₹ ${total + activitiesTotal}`]);

		doc.font("Helvetica-Bold")
			.text("Billing Details:", LEFT_MARGIN, doc.y, { underline: true });

		drawTable(doc, doc.y + 10, ["Item", "Details", "Amount"], rows);

		addFooter(doc);
		doc.end();

	} catch (err) {
		res.status(500).json({ message: "Error generating PDF" });
	}
});

// =====================================================
// 2. CANCELLATION PDF (NO REFUND)
// =====================================================
router.get("/cancel/:id", async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ message: "Booking not found" });

		const doc = new PDFDocument({ margin: 50 });
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename=Cancellation_${booking._id}.pdf`);
		doc.pipe(res);

		generateHeader(doc);

		doc.fontSize(18).fillColor("red").font("Helvetica-Bold")
			.text("Booking Cancellation", { align: "center" }).moveDown();

		doc.fillColor("black").font("Helvetica").fontSize(12);

		doc.text(`Booking ID: ${booking._id}`, LEFT_MARGIN);
		doc.text(`Customer: ${booking.name}`, LEFT_MARGIN);
		doc.text(`Contact: ${booking.contact}`, LEFT_MARGIN);
		doc.moveDown();

		doc.text(`Check-in: ${formatDate(booking.checkin)}`, LEFT_MARGIN);
		doc.text(`Check-out: ${formatDate(booking.checkout)}`, LEFT_MARGIN);
		doc.text(`Status : ${booking.status}`, LEFT_MARGIN);
		doc.moveDown();

		let rows = [];

		rows.push([`Room (${booking.room})`, "Cancelled", "₹ 0"]);

		if (booking.activities?.length > 0) {
			booking.activities.forEach((act) => {
				rows.push([act.name, "Cancelled", "₹ 0"]);
			});
		}

		rows.push(["TOTAL", "", "₹ 0"]);

		doc.font("Helvetica-Bold")
			.text("Cancellation Summary:", LEFT_MARGIN, doc.y, { underline: true });

		drawTable(doc, doc.y + 10, ["Item", "Status", "Amount"], rows);

		doc.moveDown();
		doc.text("No charges applied.", { align: "center" });

		addFooter(doc);
		doc.end();

	} catch (err) {
		res.status(500).json({ message: "Error generating PDF" });
	}
});

// =====================================================
// 3. FINAL INVOICE PDF (ACTUAL DATES)
// =====================================================
router.get("/invoice/:id", async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ message: "Booking not found" });

		const doc = new PDFDocument({ margin: 50 });
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", `attachment; filename=Invoice_${booking._id}.pdf`);
		doc.pipe(res);

		generateHeader(doc);

		doc.fontSize(18).font("Helvetica-Bold")
			.text("Final Invoice", { align: "center" }).moveDown();

		doc.font("Helvetica").fontSize(12);

		const actualCheckIn = booking.checkInTime;
		const actualCheckOut = booking.checkOutTime;

		const start = new Date(actualCheckIn);
		const end = new Date(actualCheckOut);

		start.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);

		const roomDoc = await Room.findOne({ title: booking.room });
		const roomPrice = roomDoc?.price || 0;
		const { nights, total } = calculateStay(actualCheckIn, actualCheckOut, roomPrice);

		doc.font("Helvetica-Bold").text("Customer & Booking Details:", LEFT_MARGIN);
		doc.moveDown(0.5);

		doc.font("Helvetica");
		doc.text(`Customer Name: ${booking.name}`, LEFT_MARGIN);
		doc.text(`Contact: ${booking.contact}`, LEFT_MARGIN);
		doc.text(`Booking ID: ${booking._id}`, LEFT_MARGIN);
		doc.text(`Room Type: ${booking.room}`, LEFT_MARGIN);
		doc.text(`Room No: ${booking.roomno || "N/A"}`, LEFT_MARGIN);
		doc.moveDown();

		doc.text(`Check-in: ${formatDate(actualCheckIn)}`, LEFT_MARGIN);
		doc.text(`Check-out: ${formatDate(actualCheckOut)}`, LEFT_MARGIN);
		doc.text(`Stay: ${nights} night(s)`, LEFT_MARGIN);
		doc.text(`No Of Person: ${booking.noOfPersons}`, LEFT_MARGIN);
		doc.moveDown();

		doc.text(`Total Amount: ₹ ${booking.totalBill}`, LEFT_MARGIN);
		doc.text(`Status: ${booking.status}`, LEFT_MARGIN);

		doc.moveDown(1.5);

		let rows = [];
		let activitiesTotal = 0;

		rows.push([
			`Room (${booking.room})`,
			`${nights} night(s) × ₹${roomPrice}`,
			`₹ ${total}`,
		]);

		if (booking.activities?.length > 0) {
			booking.activities.forEach((act) => {
				rows.push([act.name, "-", `₹ ${act.price}`]);
				activitiesTotal += act.price;
			});
		} else {
			rows.push(["No Activities", "-", "₹ 0"]);
		}

		rows.push(["TOTAL", "", `₹ ${total + activitiesTotal}`]);

		doc.font("Helvetica-Bold")
			.text("Invoice Details:", LEFT_MARGIN, doc.y, { underline: true });

		drawTable(doc, doc.y + 10, ["Item", "Details", "Amount"], rows);

		addFooter(doc);
		doc.end();

	} catch (err) {
		res.status(500).json({ message: "Error generating PDF" });
	}
});

module.exports = router;