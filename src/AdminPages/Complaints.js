import React, { useEffect, useState, useRef } from "react";
import SidebarAdmin from "./SidebarAdmin";
import axios from "axios";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "../AdminStyles/ComplaintsPage.css";

const Complaints = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [complaintType, setComplaintType] = useState("all");
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // SignalR connection and chat messages
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get token helper
  const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    return user?.token;
  };

  // Fetch complaints on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Initialize SignalR connection once
  useEffect(() => {
    const connect = new HubConnectionBuilder()
      .withUrl("http://shippinganddelivery.runasp.net/hubs/chat", {
        accessTokenFactory: () => getToken(),
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(connect);

    return () => {
      if (connect) connect.stop();
    };
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await axios.get("http://shippinganddelivery.runasp.net/api/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(response.data.result || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading complaints.");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toString().toLowerCase().includes(search.toLowerCase()) ||
      complaint.senderName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || complaint.status.toLowerCase() === filter;
    const matchesType = complaintType === "all" || complaint.type === complaintType;
    return matchesSearch && matchesFilter && matchesType;
  });

  const openDetailsModal = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailsModalOpen(true);
  };

  const openChatModal = (complaint) => {
    setSelectedComplaint(complaint);
    setMessages([]);
    setChatModalOpen(true);

    if (connection) {
      connection
        .start()
        .then(() => {
          // Remove previous handlers if any
          connection.off("ReceiveMessage");

          // Listen for incoming messages
          connection.on("ReceiveMessage", (msg) => {
            if (msg.complaintId === complaint.id) {
              setMessages((prev) => [...prev, msg]);
            }
          });

          // Load existing messages for this complaint from the hub or API
          connection
            .invoke("GetMessages", complaint.id)
            .then((msgs) => {
              setMessages(msgs || []);
            })
            .catch((error) => console.error("Failed to load messages:", error));
        })
        .catch((err) => console.error("SignalR Connection Error: ", err));
    }
  };

  // Close modals and clear chat state
  const closeModals = () => {
    setChatModalOpen(false);
    setDetailsModalOpen(false);
    setSelectedComplaint(null);
    setMessage("");
    setSuccessMessage("");
    setMessages([]);
    if (connection) connection.off("ReceiveMessage");
  };

  // Send chat message through SignalR
  const handleSendMessage = async () => {
    if (!message.trim() || !connection) return;
    try {
      await connection.invoke("SendMessage", {
        complaintId: selectedComplaint.id,
        content: message.trim(),
      });
      setMessage("");
      setSuccessMessage("✅ Message sent.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      alert("Error sending message.");
    }
  };

  // Change complaint status
  const handleStatusChange = async (id, newStatus) => {
    const confirmChange = window.confirm("Are you sure you want to change the status?");
    if (!confirmChange) return;

    try {
      const token = getToken();
      await axios.patch(
        `http://shippinganddelivery.runasp.net/api/complaints/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div className="complaint-container">
      <SidebarAdmin />
      <div className="content">
        <h1 className="title">Complaints Center</h1>
        {loading && <p>Loading complaints...</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-container">
          <input
            type="text"
            placeholder="🔍 Search by Order ID or Sender"
            className="search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="tabs">
            <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              All Complaints
            </button>
            <button className={`tab ${filter === "open" ? "active" : ""}`} onClick={() => setFilter("open")}>
              Open
            </button>
            <button className={`tab ${filter === "resolved" ? "active" : ""}`} onClick={() => setFilter("resolved")}>
              Resolved
            </button>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              className="type-filter"
            >
              <option value="all">All Types</option>
              <option value="Late Delivery">Late Delivery</option>
              <option value="Damaged Package">Damaged Package</option>
              <option value="Service Complaint">Service Complaint</option>
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>From</th>
                <th>Against</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7">No complaints found.</td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.id}</td>
                    <td>{complaint.type}</td>
                    <td>{complaint.senderName}</td>
                    <td>{complaint.companyName}</td>
                    <td>{new Date(complaint.createdAtUtc).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${complaint.status.toLowerCase()}`}>
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => openDetailsModal(complaint)}>
                        Details
                      </button>
                      {complaint.status.toLowerCase() === "open" && (
                        <button className="chat-btn" onClick={() => openChatModal(complaint)}>
                          Chat
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Modal */}
      {chatModalOpen && selectedComplaint && (
        <div className="custom-modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chat with {selectedComplaint.companyName}</h2>
            <div className="modal-body chat-messages" style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "10px" }}>
              {messages.length === 0 && <p>No messages yet.</p>}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${msg.sender === "admin" ? "sent" : "received"}`}
                  style={{
                    backgroundColor: msg.sender === "admin" ? "#daf1da" : "#f1f1f1",
                    textAlign: msg.sender === "admin" ? "right" : "left",
                    padding: "8px",
                    borderRadius: "8px",
                    marginBottom: "5px",
                  }}
                >
                  <p>{msg.content}</p>
                  <small>{new Date(msg.timestamp).toLocaleString()}</small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {successMessage && <div className="success-message">{successMessage}</div>}
            <textarea
              rows="4"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="send-btn" onClick={handleSendMessage} disabled={!message.trim()}>
              Send Message
            </button>
            <button onClick={closeModals} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedComplaint && (
        <div className="custom-modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Complaint Details</h2>
            <div className="modal-body">
              <p>
                <strong>ID:</strong> {selectedComplaint.id}
              </p>
              <p>
                <strong>Type:</strong> {selectedComplaint.type}
              </p>
              <p>
                <strong>From:</strong> {selectedComplaint.senderName}
              </p>
              <p>
                <strong>Against:</strong> {selectedComplaint.companyName}
              </p>
              <p>
                <strong>Date:</strong> {new Date(selectedComplaint.createdAtUtc).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <select
                  value={selectedComplaint.status}
                  onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                  className="status-dropdown"
                >
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
              </p>
              <p>
                <strong>Details:</strong> {selectedComplaint.content}
              </p>
            </div>
            <button onClick={closeModals} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
