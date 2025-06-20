import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { AlertCircle, Building, Send, PlusCircle, CheckCircle } from "lucide-react";
import SidebarAdmin from "./SidebarAdmin";
import axios from "axios";
import "../CompanyStyles/Dashboard.css";

const getToken = () => {
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));
  return user?.token;
};

const Header = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      setErrorNotifications(null);
      const token = getToken();
      if (!token) {
        setErrorNotifications("User not authenticated");
        setLoadingNotifications(false);
        return;
      }
      try {
        const response = await axios.get(
          "http://shippinganddelivery.runasp.net/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const result = response.data;
        if (result.isSuccess && Array.isArray(result.data)) {
          const formatted = result.data.map((notif, index) => ({
            id: `notif-${index}`,
            type: "system",
            icon: <AlertCircle size={18} color="#2196f3" />,
            message: notif.content,
            details: notif.createdAtUtc
              ? new Date(notif.createdAtUtc).toLocaleString()
              : "No date",
          }));
          setNotifications(formatted);
        } else {
          setErrorNotifications("Failed to fetch notifications");
          console.error("API error:", result.errors);
        }
      } catch (err) {
        setErrorNotifications(err.message || "Fetch error");
        console.error("Fetch error:", err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const updateProfile = () => {
      const savedEmail = localStorage.getItem("email");
      const savedImage = localStorage.getItem("profileImage");
      if (savedEmail) {
        const name = savedEmail.split("@")[0];
        setCompanyName(name);
      }
      if (savedImage) {
        setProfileImage(savedImage);
      }
    };

    updateProfile();
    window.addEventListener("storage", updateProfile);
    return () => window.removeEventListener("storage", updateProfile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target) &&
        showNotifications
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <>
      <div className="header">
        <h2>
          Hello, <br />
          <span>Welcome to Your Admin Dashboard</span>
        </h2>
        <div className="profile-section">
          <div className="notification-wrapper" ref={notifRef}>
            <FaBell
              className="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ cursor: "pointer" }}
            />
            {showNotifications && (
              <div className="notification-dropdown advanced">
                <h4>Notifications</h4>
                {loadingNotifications && <p>Loading...</p>}
                {errorNotifications && (
                  <p style={{ color: "red" }}>Error: {errorNotifications}</p>
                )}
                <ul>
                  {notifications.length === 0 && !loadingNotifications && (
                    <li>No notifications</li>
                  )}
                  {notifications.map((item) => (
                    <li
                      key={item.id}
                      className={`notification-item ${item.type}`}
                    >
                      <div className="notif-icon">{item.icon}</div>
                      <div className="notif-content">
                        <strong>{item.message}</strong>
                        <p>{item.details}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div
            className="profile"
            style={{ cursor: "pointer" }}
            title={companyName || "Admin"}
          >
            <img src={`${process.env.PUBLIC_URL}/profile.jpg`} alt="Company" />
            <span>{companyName || "Admin"}</span>
          </div>
        </div>
      </div>
    </>
  );
};

const DashboardAdmin = () => {
  const stats = [
  {
    id: 1,
    title: "All Companies",
    icon: <Building size={24} />,
    link: "/companies",
  },
  {
    id: 2,
    title: "All Complaints",
    icon: <AlertCircle size={24} />,
    link: "/complaints",
  },
  {
    id: 3,
    title: "Unread Messages",
    icon: <Send size={24} />,
    link: "/chat-admin",
  },
  {
    id: 4,
    title: "Avg. Rating",
    value: "4.2 ★",
    icon: <CheckCircle size={24} color="#4caf50" />,
    link: null, // no navigation
  },
  {
    id: 5,
    title: "Create Company",
    icon: <PlusCircle size={24} />,
    link: "/first",
  },
];

  return (
    <div className="dashboard-container">
      <SidebarAdmin />
      <div className="content">
        <Header />
        <div className="stats-grid">
          {stats.map((stat) => (
            <Link to={stat.link || "#"} key={stat.id} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
