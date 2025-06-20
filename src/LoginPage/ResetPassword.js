import React, { useState } from "react";
import "../LoginStyles/ResetPassword.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const showModal = (message, type = "error") => {
    setModal({ show: true, message, type });
    setTimeout(() => setModal({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      showModal("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showModal("Passwords do not match.");
      return;
    }

    if (!email) {
      showModal("Missing email information.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://shippinganddelivery.runasp.net/api/users/reset-password",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      showModal(res.data?.message || "Password reset successful!", "success");

      setTimeout(() => {
        localStorage.removeItem("resetEmail");
        navigate("/login");
      }, 1500);
    } catch (err) {
      showModal(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="left-side">
       <img src={`${process.env.PUBLIC_URL}/ship-smart.jpg`} alt="illustration logo" className="logo" />
<img src={`${process.env.PUBLIC_URL}/boy.png`} alt="illustration" className="illustration" />

      </div>

      <div className="right-side">
        <form onSubmit={handleSubmit}>
          <h2>Reset Password</h2>

          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>

      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.type}`}>
            <p>{modal.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
