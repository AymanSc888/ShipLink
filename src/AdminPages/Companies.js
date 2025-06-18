// CompaniesPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin";
import * as signalR from "@microsoft/signalr";
import "../AdminStyles/CompaniesPage.css";

const getToken = () => {
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));
  return user?.token;
};

const ModalMessage = ({ type = "info", message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`modal-msg ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

const CompaniesPage = () => {
  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const location = useLocation();
  const [companies, setCompanies] = useState([]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "info" }), 3000);
  };

  useEffect(() => {
    const token = getToken();
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://shippinganddelivery.runasp.net/hubs/chat", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR as admin.");
          setToast({ message: "Connected to chat server.", type: "success" });
        })
        .catch((err) => {
          console.error("SignalR Connection Error:", err);
          setToast({
            message: "Failed to connect to chat server.",
            type: "error",
          });
        });

      connection.onreconnecting((err) => {
        setToast({ message: "Reconnecting to chat...", type: "warning" });
      });

      connection.onreconnected(() => {
        setToast({ message: "Reconnected to chat.", type: "success" });
      });

      connection.onclose((err) => {
        setToast({ message: "Disconnected from chat server.", type: "error" });
      });
    }
  }, [connection]);

  const fetchCompanies = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      showToast("User is not authenticated", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://shippinganddelivery.runasp.net/api/companies",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const companiesData = response.data?.data || [];
      setCompanies(companiesData);
      localStorage.setItem("companyList", JSON.stringify(companiesData));
    } catch (error) {
      console.error("Error fetching companies:", error);
      showToast("Error loading companies.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchCompanies();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredCompanies = companies.filter((company) =>
    company.name?.toLowerCase().trim().includes(search.toLowerCase().trim())
  );

  const openModal = (type, company) => {
    setModalType(type);
    setSelectedCompany({ ...company });
  };

  const closeModal = () => {
    setModalType("");
    setSelectedCompany(null);
    setMessage("");
    setMessageSent(false);
    setCompanyDetails(null);
    setConfirmDeleteModal(false);
    setCompanyToDelete(null);
  };

  const handleDelete = async () => {
    if (isDeleting || !companyToDelete) return;
    const token = getToken();
    if (!token) {
      showToast("User not authenticated. Please login again.", "error");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `http://shippinganddelivery.runasp.net/api/companies/${companyToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      closeModal();
      showToast("Company deleted successfully.", "success");
    } catch (error) {
      if (error.response?.status === 403) {
        showToast("You are not allowed to delete this company.", "error");
      } else if (error.response?.status === 404) {
        showToast("Company not found.", "error");
      } else {
        showToast("Error deleting company.", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (company) => {
    setCompanyToDelete(company);
    setConfirmDeleteModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedCompany) return;

    const token = getToken();
    if (!token) {
      showToast("You are not authenticated.", "error");
      return;
    }

    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      showToast("Trying to reconnect. Please wait...", "warning");
      try {
        await connection.start(); // محاولة إعادة الاتصال
      } catch (err) {
        console.error("Reconnection failed:", err);
        showToast("Cannot send message. Connection issue.", "error");
        return;
      }
    }

    try {
      const response = await axios.post(
        `http://shippinganddelivery.runasp.net/api/chats?companyId=${selectedCompany.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const chatId = response.data?.data?.id;
      if (!chatId) {
        showToast("Could not initiate chat.", "error");
        return;
      }

      await connection.invoke("SendMessage", chatId, message.trim());
      setMessageSent(true);
      setMessage("");
      setTimeout(() => setMessageSent(false), 3000);
      showToast("Message sent successfully.", "success");
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message. Try again.", "error");
    }
  };

  const fetchCompanyDetails = async (id) => {
    setLoadingModal(true);
    const token = getToken();
    if (!token) {
      showToast("User is not authenticated", "error");
      setLoadingModal(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://shippinganddelivery.runasp.net/api/companies/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.isSuccess) {
        setCompanyDetails(response.data.data);
        setModalType("view");
      } else {
        showToast("Company not found.", "error");
      }
    } catch (error) {
      showToast("Error fetching company details.", "error");
    } finally {
      setLoadingModal(false);
    }
  };
  return (
    <div className="companies-container">
      <SidebarAdmin />
      <main className="content">
        <h1 className="title">Companies</h1>

        {loading ? (
          <p>Loading companies...</p>
        ) : (
          <>
            <div className="table-container">
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-bar"
              />

              <table className="companies-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Company Name</th>
                    <th>Contact</th>
                    <th>Rating</th>
                    <th>Phone Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <tr key={company.id}>
                        <td>{company.id}</td>
                        <td>{company.name}</td>
                        <td>
                          {company.contactEmail ||
                            company.contact ||
                            company.email ||
                            "N/A"}
                        </td>
                        <td>{company.rating ?? "N/A"}</td>
                        <td>{company.phoneNumber || "N/A"}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() => fetchCompanyDetails(company.id)}
                            >
                              👁 View
                            </button>
                            <button
                              className="chat-btn"
                              onClick={() => openModal("chat", company)}
                            >
                              💬 Chat
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => confirmDelete(company)}
                              style={{ backgroundColor: "red", color: "white" }}
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No companies found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal for view/chat */}
        {modalType && (selectedCompany || companyDetails) && (
          <div
            className="custom-modal-overlay"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {modalType === "view"
                  ? "Company Details"
                  : `Chat with ${selectedCompany?.name}`}
              </h2>

              {modalType === "view" && (
                <div className="modal-body">
                  {loadingModal ? (
                    <p>Loading details...</p>
                  ) : companyDetails ? (
                    <>
                      <p>
                        <strong>ID:</strong> {companyDetails.id}
                      </p>
                      <p>
                        <strong>Name:</strong> {companyDetails.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {companyDetails.email || "N/A"}
                      </p>
                      <p>
                        <strong>Rating:</strong>{" "}
                        {companyDetails.rating ?? "N/A"}
                      </p>
                      <p>
                        <strong>Phone Number:</strong>{" "}
                        {companyDetails.phoneNumber ?? "N/A"}
                      </p>
                      <p>
                        <strong>Logo:</strong>
                      </p>
                      {companyDetails.logo ? (
                        <img
                          src={companyDetails.logo}
                          alt="Logo"
                          width="100"
                          style={{ borderRadius: "8px" }}
                        />
                      ) : (
                        <p>No logo available.</p>
                      )}
                    </>
                  ) : (
                    <p>No company details to show.</p>
                  )}
                </div>
              )}

              {modalType === "chat" && (
                <div className="modal-body">
                  <textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !message.trim() ||
                      connection?.state !== signalR.HubConnectionState.Connected
                    }
                    className="send-btn"
                  >
                    Send
                  </button>

                  {messageSent && (
                    <p style={{ color: "green" }}>Message sent successfully!</p>
                  )}
                </div>
              )}

              <button onClick={closeModal} className="close-btn">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDeleteModal && (
          <div
            className="custom-modal-overlay"
            onClick={() => setConfirmDeleteModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "400px" }}
            >
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{companyToDelete?.name}</strong>?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button onClick={() => setConfirmDeleteModal(false)}>
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompaniesPage;
