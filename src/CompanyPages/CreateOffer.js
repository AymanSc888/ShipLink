import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../CompanyStyles/CreateOffer.css";

const CreateOffer = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state;
  const navigate = useNavigate();

  const [price, setPrice] = useState("");
  const [estimatedDeliveryTimeInDays, setEstimatedDeliveryTimeInDays] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const userData =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (!userData?.token) {
      setError("User is not authenticated");
      return;
    }

    try {
      const decodedToken = jwtDecode(userData.token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        setError("Session expired. Please login again.");
        return;
      }
      setToken(userData.token);
    } catch {
      setError("Invalid token");
    }
  }, []);

  if (!order) {
    return (
      <div className="create-offer-container">
        <h2>Order data is missing</h2>
        <p>Please navigate to this page via the orders list.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!orderId) {
      setError("Order ID is missing!");
      return;
    }
    if (Number(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (Number(estimatedDeliveryTimeInDays) < 1) {
      setError("Estimated delivery time must be at least 1 day");
      return;
    }
    if (!token) {
      setError("You are not authorized to create offers");
      return;
    }

    const data = {
      orderId,
      price: Number(price),
      estimatedDeliveryTimeInDays: Number(estimatedDeliveryTimeInDays),
      notes: notes.trim(),
    };

    setLoading(true);

    try {
      await axios.post("http://shippinganddelivery.runasp.net/api/offers", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/offers-sent");
      }, 2000);
    } catch (err) {
      console.error("Error creating offer:", err);
      const apiError = err.response?.data;
      const fallbackMessage = err.message || "Failed to create offer";
      const message =
        apiError?.errors?.Order ||
        apiError?.message ||
        fallbackMessage;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-offer-container">
      <h2>Create Offer for Order: {orderId}</h2>

      <div>
        <p><strong>Customer:</strong> {order.ownerName || order.customer}</p>
        <p><strong>From:</strong> {order.pickupLocation} → <strong>To:</strong> {order.destination}</p>
        <p><strong>Weight:</strong> {order.weightInKg} kg</p>
        <p><strong>Package Size:</strong> {order.packageSize}</p>
      </div>

      <form onSubmit={handleSubmit} className="create-offer-form">
        <label>
          Price:
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label>
          Estimated Delivery Time (Days):
          <input
            type="number"
            min="1"
            value={estimatedDeliveryTimeInDays}
            onChange={(e) => setEstimatedDeliveryTimeInDays(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            disabled={loading}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Offer"}
        </button>
      </form>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>✅ Offer Created Successfully</h3>
            <p>You will be redirected shortly...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOffer;
