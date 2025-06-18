import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../CompanyStyles/InProgressOrders.css";
import { jwtDecode } from "jwt-decode";
import * as signalR from "@microsoft/signalr";

const AcceptedOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [chatVisible, setChatVisible] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const connectionRef = useRef(null);
  const tokenRef = useRef("");

  // ✅ Get Token on mount
  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (storedUser?.token) tokenRef.current = storedUser.token;
  }, []);

  // ✅ Fetch accepted offers
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const token = tokenRef.current;
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          setError("Session expired. Please login again.");
          return;
        }

        const response = await fetch("http://shippinganddelivery.runasp.net/api/offers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch offers");
        const result = await response.json();
        const offersData = result.data || result;

        const accepted = offersData.filter(
          (offer) => offer.status?.toLowerCase() === "accepted"
        );

        const mapped = accepted.map((offer) => ({
          id: offer.id,
          orderId: offer.orderId,
          price: offer.price ? `${offer.price} EGP` : "N/A",
          status: offer.status,
          companyName: offer.companyName || "Unknown",
          date: new Date(offer.createdAtUtc).toLocaleDateString(),
        }));

        setOffers(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // ✅ Chat connection setup
  useEffect(() => {
    if (!chatRoomId || !chatVisible || !tokenRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://shippinganddelivery.runasp.net/hubs/chat", {
        accessTokenFactory: () => tokenRef.current,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR connected.");
        connection.invoke("JoinRoom", chatRoomId);
      })
      .catch((err) => console.error("Connection failed:", err));

    connection.on("ReceiveMessage", (user, message) => {
      setMessages((prev) => [...prev, { user, message }]);
    });

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke("LeaveRoom", chatRoomId).catch(() => {});
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [chatRoomId, chatVisible]);

  // ✅ Send message
  const sendMessage = async () => {
    if (messageInput && connectionRef.current) {
      try {
        await connectionRef.current.invoke("SendMessageToRoom", chatRoomId, messageInput);
        setMessages((prev) => [...prev, { user: "You", message: messageInput }]);
        setMessageInput("");
      } catch (err) {
        console.error("Send message error:", err);
      }
    }
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.id.toString().includes(searchTerm) ||
      offer.orderId?.toString().includes(searchTerm) ||
      offer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="in-progress-container">
      <Sidebar />
      <div className="content">
        <h1 className="title">Accepted Offers</h1>

        {loading && <p>Loading offers...</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-container">
          <input
            type="text"
            placeholder="Search by Offer ID or Company"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <i className="fas fa-search search-icon"></i>

          {filteredOffers.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-box-open"></i>
              <p>No accepted offers found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Offer ID</th>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.id}</td>
                    <td>{offer.orderId}</td>
                    <td>{offer.companyName}</td>
                    <td>{offer.price}</td>
                    <td>{offer.date}</td>
                    <td>
                      <span className="status accepted">Accepted</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setShowModal(true);
                          }}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button
                          className="chat-btn"
                          onClick={() => {
                            setMessages([]);
                            setChatRoomId(offer.orderId);
                            setChatVisible(true);
                          }}
                        >
                          <i className="fas fa-phone"></i> Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showModal && selectedOffer && (
        <div className="custom-modal-overlay">
          <div className="modal-content">
            <h2>Offer Details</h2>
            <p><strong>Offer ID:</strong> {selectedOffer.id}</p>
            <p><strong>Order ID:</strong> {selectedOffer.orderId}</p>
            <p><strong>Company:</strong> {selectedOffer.companyName}</p>
            <p><strong>Price:</strong> {selectedOffer.price}</p>
            <p><strong>Status:</strong> {selectedOffer.status}</p>
            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatVisible && (
        <div className="custom-modal-overlay">
          <div className="modal-content chat-modal">
            <h2>Chat Room: {chatRoomId}</h2>
            <div className="chat-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
              {messages.map((msg, idx) => (
                <p key={idx}><strong>{msg.user}:</strong> {msg.message}</p>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
              <button className="close-btn" onClick={() => setChatVisible(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedOffers;
