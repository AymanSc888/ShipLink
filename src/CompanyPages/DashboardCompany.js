import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import {
  ShoppingCart,
  Send,
  Truck,
  CheckCircle,
  CreditCard,
  Settings,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../CompanyStyles/Dashboard.css";

const getToken = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user)?.token || null;
  } catch {
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [companyName, setCompanyName] = useState("Company");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);
  const notifRef = useRef(null);

const stats = [
  {
    id: 1,
    title: "Pending Shipments",
    icon: <ShoppingCart size={22} color="#ff9800" />, 
    link: "/new-orders",
  },
  {
    id: 2,
    title: "Sent Offers",
    icon: <Send size={22} color="#2196f3" />,   
    link: "/offers-sent",
  },
  {
    id: 3,
    title: "In Progress",
    icon: <Truck size={22} color="#3f51b5" />,
    link: "/in-progress-orders",
  },
  {
    id: 4,
    title: "Completed",
    icon: <CheckCircle size={22} color="#4caf50" />,
    link: "/completed",
  },
  {
    id: 5,
    title: "Payment",
    icon: <CreditCard size={22} color="#9c27b0" />, 
    link: "/payment",
  },
  {
    id: 6,
    title: "Settings",
    icon: <Settings size={22} color="#607d8b" />, 
    link: "/settings",
  },
  {
    id: 7,
    title: "Chat Center",
    icon: <MessageCircle size={22} color="#00bcd4" />,
    link: "/chat-company",
  },
];


  const fetchNotifications = async () => {
    setErrorNotifications(null);
    setLoadingNotifications(true);
    const token = getToken();

    if (!token) {
      alert("User is not authenticated");
      setLoadingNotifications(false);
      navigate("/login");
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
        const formattedNotifications = result.data.map((item) => ({
          id: item.id || item.createdAtUtc || Math.random(),
          type: "system",
          icon: <AlertCircle size={18} color="#2196F3" />,
          message: item.content,
          details: item.createdAtUtc
            ? new Date(item.createdAtUtc).toLocaleString()
            : "No date",
        }));
        setNotifications(formattedNotifications);
      } else {
        setErrorNotifications("Failed to fetch notifications");
      }
    } catch (error) {
      setErrorNotifications("Error fetching notifications");
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const userData =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (!userData?.token) {
      navigate("/login");
      return;
    }

    // اسم الشركة من البريد (تقدر تعدل لو عندك API اسمه صريح)
    if (userData?.email) {
      const name = userData.email.split("@")[0];
      setCompanyName(name);
    }

    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }

    fetchNotifications();

    window.addEventListener("storage", fetchNotifications);
    return () => window.removeEventListener("storage", fetchNotifications);
  }, [navigate]);

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
    <div className="dashboard-container">
      <Sidebar />

      <div className="content">
        <div className="header">
          <h2>
            Hello, <br />
            <span>Welcome to Your Company Dashboard</span>
          </h2>

          <div className="profile-section">
            <div className="notification-wrapper" ref={notifRef}>
              <FaBell
                className="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Toggle notifications"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setShowNotifications(!showNotifications);
                }}
              />
              {showNotifications && (
                <div className="notification-dropdown advanced" role="region" aria-live="polite">
                  <h4>Notifications</h4>
                  {loadingNotifications && <p>Loading...</p>}
                  {errorNotifications && (
                    <p style={{ color: "red" }}>Error: {errorNotifications}</p>
                  )}
                  <ul>
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
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
                      ))
                    ) : (
                      !loadingNotifications && <li>No notifications</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="profile">
              <img src={profileImage || "/profile.jpg"} alt="Company" />
              <span>{companyName}</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <Link to={stat.link} key={stat.id} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                {stat.value !== undefined && (
                  <div className="stat-value">{stat.value}</div>
                )}
                <div className="stat-title">{stat.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
