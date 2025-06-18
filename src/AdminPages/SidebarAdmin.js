import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBuilding,
  FaExclamationCircle,
  FaPlusCircle,
  FaUsers,
  FaSignOutAlt,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import "../CompanyStyles/Sidebar.css";

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div
          className="toggle-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
        </div>

        <div className="logo-container">
          <img src="/ship-smart.jpg" alt="logo" className="logo" />
        </div>

        <ul className="menu">
          <li className={isActive("/dashboard-admin") ? "active" : ""}>
            <Link to="/dashboard-admin" className="menu-item">
              <FaTachometerAlt /> {!isCollapsed && "Dashboard"}
            </Link>
          </li>

          <li className={isActive("/companies") ? "active" : ""}>
            <Link to="/companies" className="menu-item">
              <FaBuilding /> {!isCollapsed && "Companies"}
            </Link>
          </li>

          <li className={isActive("/complaints") ? "active" : ""}>
            <Link to="/complaints" className="menu-item">
              <FaExclamationCircle /> {!isCollapsed && "Complaints"}
            </Link>
          </li>

          <li className={isActive("/first") ? "active" : ""}>
            <Link to="/first" className="menu-item">
              <FaPlusCircle /> {!isCollapsed && "Create Company"}
            </Link>
          </li>

          <li className={isActive("/chat-admin") ? "active" : ""}>
            <Link to="/chat-admin" className="menu-item">
              <FaUsers /> {!isCollapsed && "Chat Center"}
            </Link>
          </li>

          <li>
            <button className="menu-item logout" onClick={toggleLogoutModal}>
              <FaSignOutAlt /> {!isCollapsed && "Log out"}
            </button>
          </li>
        </ul>
      </div>

      {showLogoutModal && (
        <div className="logout-modal">
          <div className="modal-content">
            <h3>Are you sure you want to log out?</h3>
            <button onClick={handleLogout} className="btn-logout-yes">
              Yes
            </button>
            <button
              className="btn-logout-no"
              onClick={() => setShowLogoutModal(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarAdmin;
