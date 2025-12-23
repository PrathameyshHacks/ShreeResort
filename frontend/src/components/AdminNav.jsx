import { Link } from "react-router-dom";

function AdminNav() {

    return(
        <>
            <div className="AdNav">
                <div className="logo">
                    <Link to="/admin" className="logo-link">
					🏨 Shree Moraya Lodge Admin
				    </Link>
                </div>
                <nav className="nav">
                  <Link to="/admin">Dashboard</Link>
                  <Link to="/admin/bookings">Bookings</Link>
                  <Link to="/admin/rooms">Rooms</Link>
                  <Link to="/admin/reports" className="active">Reports</Link>
                  <Link to="/login" className="btn">Logout</Link>
                </nav>
            </div>
            <div className="dummyHead"></div>
            <style>
                {`    
                
                    * {
                    	margin: 0;
                    	padding: 0;
                    	box-sizing: border-box;
                    }
                                    
                    html, body {
                    	width: 100%;
                    	overflow-x: hidden; /* 🔥 fixes left-right shift */
                    }
                                    
                    
                    .AdNav {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      background-color: #a3f1ff;
                     
                      width:100%;
                      top: 0;
                      z-index: 100;
                      height:10vh;
                      position:fixed;
                    }

                    .logo {
                      font-size: 24px;
                      font-weight: bold;
                      color: #0a4d91;
                    }

                    .nav a {
                      margin-left: 20px;
                      text-decoration: none;
                      color: #333;
                      font-weight: 500;
                    }

                    .nav a:hover {
                      color: #0a4d91;
                    }

                    .nav .btn {
                      background-color: #0a4d91;
                      color: #fff;
                      padding: 8px 14px;
                      border-radius: 4px;
                      font-weight: bold;
                    }

                    .nav .btn:hover {
                      background-color: #083b70;
                    }       
                      
                    
                    .dummyHead {
                        height:10vh;
                        background-color: #a3f1ff;               
                    }
                `
                }
            </style>
        
        </>


    );

}

export default AdminNav;