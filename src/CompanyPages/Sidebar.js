/* eslint-disable no-template-curly-in-string */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaComments,
  FaSignOutAlt,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaCreditCard,
  FaCog,
} from "react-icons/fa";
import "../CompanyStyles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const userData =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (userData?.email) {
      setEmail(userData.email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const toggleLogoutModal = () => {
    setShowLogoutModal((prev) => !prev);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div
        className="toggle-button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
      </div>

      <img src="/ship-smart.jpg" alt="logo" className="logo" />

<ul className="menu">
  <li className={location.pathname === "/dashboard-company" ? "active" : ""}>
    <Link to="/dashboard-company" className="menu-item">
      <FaTachometerAlt /> {!isCollapsed && "Dashboard"}
    </Link>
  </li>

  <li className={location.pathname === "/new-orders" ? "active" : ""}>
    <Link to="/new-orders" className="menu-item">
      <FaBox /> {!isCollapsed && "Pending Orders"}
    </Link>
  </li>

  <li className={location.pathname === "/offers-sent" ? "active" : ""}>
    <Link to="/offers-sent" className="menu-item">
      <FaPaperPlane /> {!isCollapsed && "Sent Offers"}
    </Link>
  </li>

  <li className={location.pathname === "/in-progress-orders" ? "active" : ""}>
    <Link to="/in-progress-orders" className="menu-item">
      <FaSpinner /> {!isCollapsed && "In Progress"}
    </Link>
  </li>

  <li className={location.pathname === "/completed" ? "active" : ""}>
    <Link to="/completed" className="menu-item">
      <FaCheckCircle /> {!isCollapsed && "Completed"}
    </Link>
  </li>

  <li className={location.pathname === "/chat-company" ? "active" : ""}>
    <Link to="/chat-company" className="menu-item">
      <FaComments /> {!isCollapsed && "Chat Center"}
    </Link>
  </li>

  <li className={location.pathname === "/payment" ? "active" : ""}>
    <Link to="/payment" className="menu-item">
      <FaCreditCard /> {!isCollapsed && "Payments"}
    </Link>
  </li>

  <li className={location.pathname === "/settings" ? "active" : ""}>
    <Link to="/settings" className="menu-item">
      <FaCog /> {!isCollapsed && "Settings"}
    </Link>
  </li>

  <li>
    <button className="menu-item logout" onClick={toggleLogoutModal}>
      <FaSignOutAlt /> {!isCollapsed && "Log Out"}
    </button>
  </li>
</ul>


      {showLogoutModal && (
        <div className="logout-modal">
          <div className="modal-content">
            <h3>Are you sure you want to log out?</h3>
            <button onClick={handleLogout} className="btn-logout-yes">
              Yes
            </button>
            <button onClick={toggleLogoutModal} className="btn-logout-no">
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
