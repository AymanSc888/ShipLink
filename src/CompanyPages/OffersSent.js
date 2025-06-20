import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { jwtDecode } from "jwt-decode";
import "../CompanyStyles/OffersSent.css";

const SentOffers = () => {
  const [search, setSearch] = useState("");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);

      try {
        const storedUser =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        if (!storedUser?.token) {
          setError("User not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const decodedToken = jwtDecode(storedUser.token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          setError("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        const res = await fetch("http://shippinganddelivery.runasp.net/api/offers", {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch offers");

        const result = await res.json();
        const offersData = result.data || result;

       const transformed = offersData
  .filter((o) => o.status === "Pending" || o.status === "Expired")
  .map((o) => ({
    offerId: o.id,
    orderId: o.orderId,
    customer: o.customerName || "Unknown",
    price: o.price,
    duration: o.estimatedDeliveryTimeInDays,
    status: o.status,
    date: o.createdAtUtc,
  }));


        setOffers(transformed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = offers
    .filter((offer) =>
      statusFilter === "All" ? true : offer.status === statusFilter
    )
    .filter(
      (offer) =>
        offer.offerId?.toString().includes(search) ||
        offer.orderId?.toString().includes(search) ||
        offer.customer?.toLowerCase().includes(search.toLowerCase())
    );

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "expired":
        return "expired";
      default:
        return "";
    }
  };

  const handleViewClick = (offer) => {
    setSelectedOffer(offer);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="sent-offers-container">
      <Sidebar />
      <main className="content">
        <h1 className="title">Offers Sent</h1>

        {loading && <p>Loading offers...</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-controls">
          <input
            type="text"
            placeholder="Search by Offer ID, Order ID or Customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Offer ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => (
                  <tr key={offer.offerId}>
                    <td>{offer.offerId}</td>
                    <td>{offer.orderId}</td>
                    <td>{offer.customer}</td>
                    <td>{offer.price} EGP</td>
                    <td>{offer.duration} days</td>
                    <td>
                      <span className={`status ${getStatusClass(offer.status)}`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(offer.date)}</td>
                    <td>
                      <button onClick={() => handleViewClick(offer)} className="view-btn">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    {search || statusFilter !== "All"
                      ? "No offers found matching your filters."
                      : "No offers sent yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedOffer && !isEditing && (
          <div
            className="custom-modal-overlay"
            onClick={(e) => {
              if (e.target.className === "custom-modal-overlay") {
                setSelectedOffer(null);
              }
            }}
          >
            <div className="modal-content">
              <button onClick={() => setSelectedOffer(null)} className="close-btn">
                ×
              </button>
              <h2>Offer Details</h2>
              <p><strong>Offer ID:</strong> {selectedOffer.offerId}</p>
              <p><strong>Order ID:</strong> {selectedOffer.orderId}</p>
              <p><strong>Customer:</strong> {selectedOffer.customer}</p>
              <p><strong>Price:</strong> {selectedOffer.price} EGP</p>
              <p><strong>Duration:</strong> {selectedOffer.duration} days</p>
              <p><strong>Status:</strong> {selectedOffer.status}</p>
              <p><strong>Date:</strong> {formatDate(selectedOffer.date)}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SentOffers;
