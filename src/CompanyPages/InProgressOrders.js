import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../CompanyStyles/InProgressOrders.css";
import { jwtDecode } from "jwt-decode";

const InProgressOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [confirmShipModal, setConfirmShipModal] = useState(false);
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
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const [res1, res2] = await Promise.all([
          fetch("http://shippinganddelivery.runasp.net/api/orders?status=PendingPayment", {
            headers: { Authorization: `Bearer ${storedUser.token}` },
          }),
          fetch("http://shippinganddelivery.runasp.net/api/orders?status=Placed", {
            headers: { Authorization: `Bearer ${storedUser.token}` },
          }),
        ]);

        if (!res1.ok || !res2.ok) throw new Error("Failed to fetch orders");

        const data1 = await res1.json();
        const data2 = await res2.json();
        const allOrders = [...(data1.data || data1), ...(data2.data || data2)];

        const mapped = allOrders.map((order) => ({
          id: order.id,
          customer: order.ownerName || "Unknown",
          from: order.pickupLocation,
          to: order.destination,
          date: new Date(order.createdAtUtc).toLocaleDateString(),
          status: order.status,
          price: order.price || "N/A",
          trackingNumber: order.trackingNumber || "N/A",
        }));

        setOrders(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(searchTerm) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status) => {
    switch (status?.trim().toLowerCase()) {
      case "in-transit":
        return { text: "In Transit", class: "in-transit" };
      case "preparing":
        return { text: "Preparing", class: "preparing" };
      case "placed":
        return { text: "Placed", class: "placed" };
      case "pending":
        return { text: "Pending", class: "pending" };
      case "pendingpayment":
        return { text: "Pending Payment", class: "pending-payment" };
      case "shipped":
        return { text: "Shipped", class: "shipped" };
      default:
        return { text: status, class: "unknown" };
    }
  };

  return (
    <div className="in-progress-container">
      <Sidebar />
      <div className="content">
        <h1 className="title">InProgress Orders</h1>

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
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = getStatusLabel(order.status);
                  const isPlaced = order.status?.trim().toLowerCase() === "placed";

                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.from} → {order.to}</td>
                      <td>{order.date}</td>
                      <td>{order.price === "N/A" ? "N/A" : `${order.price} EGP`}</td>
                      <td>
                        <span className={`status ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button
                          className={`ship-btn ${!isPlaced ? "disabled" : ""}`}
                          onClick={() => {
                            if (isPlaced) {
                              setShippingOrder(order);
                              setConfirmShipModal(true);
                            }
                          }}
                          disabled={!isPlaced}
                        >
                          <i className="fas fa-shipping-fast"></i> Ship
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedOrder && (
        <div className="custom-modal-overlay">
          <div className="modal-content">
            <h2>Tracking Information</h2>
            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
            <p><strong>Customer:</strong> {selectedOrder.customer}</p>
            <p><strong>From:</strong> {selectedOrder.from}</p>
            <p><strong>To:</strong> {selectedOrder.to}</p>
            <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Ship Confirmation Modal */}
      {confirmShipModal && shippingOrder && (
        <div className="custom-modal-overlay">
          <div className="modal-content">
            <h2>Confirm Shipment</h2>
            <p>Do you want to mark this order as <strong>Shipped</strong> and send it to the driver?</p>
            <button
              className="Edit-btn"
              onClick={async () => {
                try {
                  const storedUser =
                    JSON.parse(localStorage.getItem("user")) ||
                    JSON.parse(sessionStorage.getItem("user"));
                  const response = await fetch(
                    `http://shippinganddelivery.runasp.net/api/orders/${shippingOrder.id}`,
                    {
                     method: "PATCH"
,
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${storedUser.token}`,
                      },
                      body: JSON.stringify({ status: "Shipped" }),
                    }
                  );

                  if (!response.ok) throw new Error("Failed to update order status");

                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === shippingOrder.id
                        ? { ...o, status: "Shipped" }
                        : o
                    )
                  );

                  setConfirmShipModal(false);
                  setShippingOrder(null);
                } catch (err) {
                  alert("Error: " + err.message);
                }
              }}
            >
              Yes, Ship it
            </button>
            <button className="close-btn" onClick={() => setConfirmShipModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InProgressOrders;
