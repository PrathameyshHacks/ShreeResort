import Footer from "./Footer";
import Navbar from "./Navbar";

export default function AboutPage() {
	return (
		<>
			<Navbar/>
			<div className="allPage">
			<div className="about-page">
				<h1>About Shree Morya Lodge</h1>

				<div className="about-content">
					<p>
						Welcome to <strong>Shree Morya Lodge</strong>, your perfect getaway in the serene town of 
						<strong> Ganpatipule</strong>. Located approximately <strong>25 km from Ratnagiri city</strong> and just 
						<strong> 5 minutes away from the famous Ganapatipule Ganapati Temple</strong>, our lodge is also situated 
						close to the beautiful Ganapatipule beach. We provide a comfortable stay with a warm, homely atmosphere 
						for families, couples, and travelers.
					</p>

					<p>
						Shree Morya Lodge has been proudly <strong>serving guests since 2010</strong> and offers a total of 
						<strong>15 Non-AC rooms and 15 AC rooms</strong>, each equipped with two beds and suitable for 
						<strong>2 adults and 2 children</strong>. Additionally, we have <strong>3 spacious halls with 5 beds each</strong>, 
						ideal for families or friend groups, accommodating up to <strong>10–15 people</strong>. 
						The lodge also assists guests with <strong>local tourism guidance, nearby attractions, water sports, 
						and travel support</strong>, ensuring a pleasant and memorable stay.
					</p>

					<p>
						This website is developed as part of a sponsored academic project, focusing on digital transformation 
						in hospitality by providing features such as <strong>online room booking, customer reviews, tourist information, 
						and efficient booking management</strong>, making the overall experience smarter, faster, and more user-friendly.
					</p>


					
					<ul className="contact-list" id="contact-list">
						<h1>Contact Information</h1>
						<li><strong>Address:</strong> Near Toll Naka, Ganpatipule, Maharashtra</li>
						<li><strong>Phone:</strong> <a href="tel:+918888372061">+91 88883 72061</a></li>
						<li><strong>Email:</strong> <a href="mailto:info@moryalodge.com">info@moryalodge.com</a></li>
						<li><strong>Map:</strong> <a href="https://maps.google.com?q=Ganpatipule+Toll+Naka" target="_blank" rel="noreferrer">View on Google Maps</a></li>
					</ul>
				</div>
			</div>
			</div>

			<Footer/>

			{/* Inline CSS */}
			<style>{`

				.allPage {
					width:100%;
					background-color: antiquewhite;
				}

				.about-page {
					padding: 40px 20px;
					font-family: Arial, sans-serif;
					max-width: 800px;
					margin: auto;
				}

				.about-page h1 {
					text-align: center;
					color: #0a4d91;
					margin-bottom: 20px;
				}

				.about-content p {
					font-size: 16px;
					line-height: 1.6;
					margin-bottom: 15px;
					text-align: justify;
				}

				.about-content h2 {
					margin-top: 30px;
					color: #0a4d91;
					margin-bottom: 10px;
				}

.contact-list {
	list-style: none;
	padding: 0;
	margin-top: 15px;
	display: flex;
	flex-direction: column;
	align-items: center;   /* centers items horizontally */
	text-align: center;    /* centers text */
}

.contact-list li {
	margin-bottom: 10px;
	font-size: 15px;
}


				.contact-list a {
					color: #0a4d91;
					text-decoration: none;
				}

				.contact-list a:hover {
					text-decoration: underline;
				}
			`}</style>
		</>
	);
}
