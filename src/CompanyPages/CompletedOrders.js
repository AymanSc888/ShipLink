import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../CompanyStyles/InProgressOrders.css";
import { jwtDecode } from "jwt-decode";

const InProgress = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const storedUser =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        if (!storedUser?.token) {
          setError("User not authenticated.");
          return;
        }

        const decoded = jwtDecode(storedUser.token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          setError("Session expired. Please login again.");
          return;
        }

        const response = await fetch(
          "http://shippinganddelivery.runasp.net/api/orders?status=placed",
          {
            headers: {
              Authorization: `Bearer ${storedUser.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const result = await response.json();
        const ordersData = result.data || result;

        const Placed = ordersData.filter((order) =>
          ["placed"].includes(order.status?.toLowerCase())
        );

        const mapped = Placed.map((order) => ({
          id: order.id,
          customer: order.ownerName || "Unknown",
          from: order.pickupLocation,
          to: order.destination,
          date: new Date(order.createdAtUtc).toLocaleDateString(),
          status: order.status,
          trackingNumber: order.trackingNumber || "TRK-UNKNOWN",
        }));

        setOrders(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchTerm) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber.includes(searchTerm)
  );

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "in-transit":
        return { text: "In Transit", class: "in-transit" };
      case "preparing":
        return { text: "Preparing", class: "preparing" };
      case "placed":
        return { text: "Placed", class: "placed" };
      default:
        return { text: status, class: "unknown" };
    }
  };

  return (
    <div className="in-progress-container">
      <Sidebar />
      <div className="content">
        <h1 className="title">Orders In Progress</h1>

        {loading && <p>Loading orders...</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-container">
          <input
            type="text"
            placeholder="Search by Order ID or Customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <i className="fas fa-search search-icon"></i>

          {filteredOrders.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-truck"></i>
              <p>No orders in progress found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Shipment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = getStatusLabel(order.status);
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>
                        {order.from} → {order.to}
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <span className={`status ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-btn"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                          >
                            <i className="fas fa-map-marker-alt"></i> Track
                          </button>
                          <button
                            className="chat-btn"
                            onClick={() => navigate(`/chat-company`)}
                          >
                            <i className="fas fa-phone"></i> Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedOrder && (
        <div className="custom-modal-overlay">
          <div className="modal-content">
            <h2>Tracking Information</h2>
            <p>
              <strong>Order ID:</strong> {selectedOrder.id}
            </p>
            <p>
              <strong>Customer:</strong> {selectedOrder.customer}
            </p>
            <p>
              <strong>From:</strong> {selectedOrder.from}
            </p>
            <p>
              <strong>To:</strong> {selectedOrder.to}
            </p>
            <p>
              <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
            </p>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InProgress;
