function Footer() {

    return(

    <>
		<footer className="footer" id="contact">
			<p>© 2025 Shree Moraya Lodge | Developed by Team Claws</p>
		</footer>
        <style>{`


            * {
            	margin: 0;
            	padding: 0;
            	box-sizing: border-box;
            }

            html, body {
            	width: 100%;

            }

            .footer {
	            background-color: #a3f1ff;
	            color: black;
	            text-align: center;
                height: 8vh;
	            padding: 15px 0;
	            margin-top: 0px;
            }

            .footer p:hover {
                color: #ff0000ff;
            }
        `}
        </style>
    </>

    );

}

export default Footer;