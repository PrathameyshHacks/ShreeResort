import { Link } from "react-router-dom";

function AdminNav() {


const handleLogout = () => {
  localStorage.removeItem("adminToken"); // remove token from localStorage
  localStorage.removeItem("Token");
  sessionStorage.removeItem("adminToken"); // remove token from sessionStorage
  window.location.href = "/login"; // redirect to login page
};



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
                  <Link to="/admin/activities">Activities</Link>
                  <Link to="/admin/reports">Reports</Link>
                  <Link to="/admin/profile">Profile</Link>
                  <Link to="/login" className="btn" onClick={handleLogout}>Logout</Link>
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
                      flex-wrap: wrap;
                      justify-content: space-between;
                      align-items: center;
                      background-color: #a3f1ff;
                      padding: 15px 30px;
                      width: 100%;
                      top: 0;
                      z-index: 100;
                      position: fixed;
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