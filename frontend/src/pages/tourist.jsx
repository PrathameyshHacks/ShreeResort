import React, { useState } from "react";

import rope from "../images/devzip.PNG";
import para from "../images/para.jpg";
import trek from "../images/ragadv.PNG";
import scuba from "../images/scuba.PNG";
import gpule from "../images/GanPule.png";
import ratna from "../images/ratna.jpg";
import jai from "../images/Haran.jpg";
import koyna from "../images/rangana2.jpg";
import malvan from "../images/dapoli.jpg";
import g2 from "../images/AliBRam.png";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TouristPage() {
	const [selectedPlace, setSelectedPlace] = useState(null);

	const touristPlaces = [
		{
			name: "Ganapatipule Temple",
			description: "Famous for its serene beaches and the ancient Ganapati temple.",
			image: gpule,
			famousFor: "Lord Ganapati temple facing the sea and beautiful clean beach.",
			distance: "25 km from Ratnagiri city",
			howToGo: "Reach by road via NH66 or by local bus/taxi from Ratnagiri station.",
			bestTime: "October to February",
		},
		{
			name: "Ratnagiri Fort",
			description: "A historical fort offering panoramic views.",
			image: ratna,
			famousFor: "Historical significance and scenic cliff views.",
			distance: "4 km from Ratnagiri city",
			howToGo: "Accessible by auto or private vehicle.",
			bestTime: "November to March",
		},
		{
			name: "Jaigad Fort",
			description: "Sea-facing fort with lighthouse.",
			image: jai,
			famousFor: "Sunset views and lighthouse.",
			distance: "20 km from Ganapatipule",
			howToGo: "Via Ganapatipule–Jaigad road.",
			bestTime: "Winter season",
		},
		{
			name: "Koyna Wildlife Sanctuary",
			description: "Dense forests and rich biodiversity.",
			image: koyna,
			famousFor: "Trekking and waterfalls.",
			distance: "70 km from Ratnagiri",
			howToGo: "By private vehicle.",
			bestTime: "June to February",
		},
		{
			name: "Tarkarli Beach",
			description: "Crystal clear water and water sports.",
			image: malvan,
			famousFor: "Scuba diving and snorkeling.",
			distance: "140 km from Ratnagiri",
			howToGo: "Via NH66 road.",
			bestTime: "October to May",
		},
		{
			name: "Swayambhu Ganapati Temple",
			description: "Sea-facing Ganapati temple.",
			image: g2,
			famousFor: "Self-manifested Ganapati idol.",
			distance: "2 km from Ratnagiri town",
			howToGo: "By walk or auto.",
			bestTime: "All year",
		},
	];

	const adventures = [
		{
			name: "Fishing",
			description: "Traditional Konkan fishing experience.",
			image: para,
			famousFor: "Local fishing culture.",
			bestSpots: "Ratnagiri, Malvan",
			bestTime: "October to March",
		},
		{
			name: "Water Sports",
			description: "Parasailing, jet-ski, kayaking.",
			image: scuba,
			famousFor: "Adventure water sports.",
			bestSpots: "Tarkarli, Ganapatipule",
			bestTime: "October to May",
		},
		{
			name: "Ropeway Ride",
			description: "Aerial views of forts and sea.",
			image: rope,
			famousFor: "Hilltop sightseeing.",
			bestSpots: "Jaigad Fort",
			bestTime: "November to February",
		},
		{
			name: "Trekking",
			description: "Western Ghats trekking trails.",
			image: trek,
			famousFor: "Nature and mountain views.",
			bestSpots: "Koyna Sanctuary",
			bestTime: "June to February",
		},
	];

	const openDetails = (item) => setSelectedPlace(item);
	const closeModal = () => setSelectedPlace(null);

	return (
		<>
			<Navbar />

			<div className="tourist-page">
				<h1 className="page-title">
					Explore Ganapatipule & Ratnagiri
				</h1>

				<section className="TourCard">
					<h2>Famous Tourist Places</h2>
					<div className="Tcard-container">
						{touristPlaces.map((place) => (
							<div className="Tcard" key={place.name}>
								<img
									src={place.image}
									alt={place.name}
									onClick={() => openDetails(place)}
								/>
								<h3>{place.name}</h3>
								<p>{place.description}</p>
							</div>
						))}
					</div>
				</section>

				<section className="AdvCard">
					<h2>Adventure Activities</h2>
					<div className="Tcard-container">
						{adventures.map((act) => (
							<div className="Tcard adventure" key={act.name}>
								<img
									src={act.image}
									alt={act.name}
									onClick={() => openDetails(act)}
								/>
								<h3>{act.name}</h3>
								<p>{act.description}</p>
							</div>
						))}
					</div>
				</section>
			</div>

			{/* MODAL */}
			{selectedPlace && (
				<div className="modal-overlay" onClick={closeModal}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<img src={selectedPlace.image} alt={selectedPlace.name} />

						<div className="modal-content">
							<h2>{selectedPlace.name}</h2>
							<p><strong>Famous For:</strong> {selectedPlace.famousFor}</p>
							{selectedPlace.distance && <p><strong>Distance:</strong> {selectedPlace.distance}</p>}
							{selectedPlace.howToGo && <p><strong>How to Go:</strong> {selectedPlace.howToGo}</p>}
							{selectedPlace.bestSpots && <p><strong>Best Spots:</strong> {selectedPlace.bestSpots}</p>}
							<p><strong>Best Time:</strong> {selectedPlace.bestTime}</p>
						</div>

						<button className="close-btn" onClick={closeModal}>Close</button>
					</div>
				</div>
			)}

			<Footer />

			<style>{`
				.tourist-page {
					padding: 50px;
					font-family: Arial, sans-serif;
					background-color: antiquewhite;
					margin-bottom: 0px;
					padding-bottom:80px;
				}
				.page-title {
					text-align: center;
					color: #0a4d91;
					margin-bottom: 25px;
				}
				h2 {
					text-align: center;
					color: #0a4d91;
				}
				.Tcard-container {
					position:relative;
					top:30px;

					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					gap: 30px;
					margin-bottom: 40px;
				}
				.Tcard {
					width: 300px;
					background: #fff;
					padding: 15px;
					border-radius: 10px;
					box-shadow: 0 2px 10px rgba(0,0,0,0.1);
					text-align: center;
					transition: transform 0.3s ease, box-shadow 0.3s ease;
				}

				.Tcard:hover {
					transform: translateY(-5px);
					color: darkcyan;
					box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
				}
				.Tcard img {
					width: 100%;
					height: 160px;
					object-fit: cover;
					border-radius: 6px;
					cursor: pointer;
				}
				.adventure {
					background: #f0f8ff;
				}

				.AdvCard {
					position:relative;
					top:30px;
					
				
				}
				.modal-overlay {
					position: fixed;
					inset: 0;
					background: rgba(0,0,0,0.7);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 1000;
				}
				.modal {
					width: 650px;
					max-width: 90%;
					height: 600px;
					background: #fff;
					border-radius: 10px;
					padding: 15px;
					display: flex;
					flex-direction: column;
					overflow: hidden;
				}
				.modal img {
					width: 100%;
					height: 350px;
					object-fit: cover;
					border-radius: 8px;
				}
				.modal-content {
					flex: 1;
					overflow-y: auto;
					margin-top: 10px;
				}
				.close-btn {
					margin-top: 10px;
					background: #0a4d91;
					color: white;
					border: none;
					padding: 8px 16px;
					border-radius: 5px;
					cursor: pointer;
					align-self: center;
				}
			`}</style>
		</>
	);
}
