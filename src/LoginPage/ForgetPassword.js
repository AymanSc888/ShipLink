import React, { useState } from "react";
import "../LoginStyles/ForgetPassword.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setModal({
        show: true,
        message: "Please enter a valid email address.",
        type: "error",
      });
      setTimeout(() => setModal({ show: false, message: "", type: "" }), 2500);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://shippinganddelivery.runasp.net/api/users/forget-password", 
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      localStorage.setItem("resetEmail", email);

      setModal({
        show: true,
        message: response.data?.message || "Recovery code sent successfully.",
        type: "success",
      });

      setTimeout(() => {
        setModal({ show: false, message: "", type: "" });
        navigate("/verify-otp");
      }, 1500);
    } catch (error) {
      console.error("Forget password error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        "Something went wrong.";

      setModal({
        show: true,
        message,
        type: "error",
      });

      setTimeout(() => setModal({ show: false, message: "", type: "" }), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forget-password-container">
      <div className="left-side">
      <img src={`${process.env.PUBLIC_URL}/ship-smart.jpg`} alt="illustration logo" className="logo" />
<img src={`${process.env.PUBLIC_URL}/boy.png`} alt="illustration" className="illustration" />
      </div>

      <div className="right-side">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <h2>Forget Password</h2>
            <label>Email address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending..." : "Resend recovery code"}
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

export default ForgetPassword;
