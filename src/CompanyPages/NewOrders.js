import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../CompanyStyles/NewOrder.css";

const NewOrders = () => {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const userData =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));

      if (!userData?.token) {
        setError("No authentication token found. Please login.");
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(userData.token);
      console.log(
        "Role:",
        decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ]
      );

      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://shippinganddelivery.runasp.net/api/orders`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Orders from API:", response.data.data);

      if (response.data?.data && response.data.data.length > 0) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
      }
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error fetching orders: " + (err.message || err));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const searchTerm = search.toLowerCase();
    return (
      String(order.id).toLowerCase().includes(searchTerm) ||
      order.ownerName.toLowerCase().includes(searchTerm) ||
      order.pickupLocation.toLowerCase().includes(searchTerm) ||
      order.destination.toLowerCase().includes(searchTerm)
    );
  });

  const handleCreateOffer = (order) => {
    navigate(`/create-offer/${order.id}`, { state: order });
  };

  return (
    <div className="new-orders-container">
      <Sidebar />
      <div className="content">
        <h1 className="title">New Orders</h1>
        <div className="table-container">
          <input
            type="text"
            placeholder="Search by Order ID or Customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
          <i className="fas fa-search search-icon"></i>

          {loading && <p>Loading orders...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && filteredOrders.length === 0 && (
            <p>No orders found for your company.</p>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Weight</th>
                  <th>Size</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Order ID">{order.id}</td>
                    <td data-label="Customer">{order.ownerName}</td>
                    <td data-label="Destination">
                      {order.pickupLocation} → {order.destination}
                    </td>
                    <td data-label="Weight">{order.weightInKg} kg</td>
                    <td data-label="Size">{order.packageSize}</td>
                    <td data-label="Date">
                      {new Date(order.createdAtUtc).toLocaleDateString()}
                    </td>
                    <td data-label="Actions">
                      <button
                        className="view-btn"
                        onClick={() => handleCreateOffer(order)}
                      >
                        <i className="fas fa-file-alt"></i> Create Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewOrders;
