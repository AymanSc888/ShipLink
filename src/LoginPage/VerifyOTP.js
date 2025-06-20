import React, { useState } from "react";
import "../LoginStyles/VerifyOTP.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../LoginStyles/VerifyOTP.css'

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 4 || !email) {
      setModal({
        show: true,
        message: "Please enter the correct code.",
        type: "error",
      });
      setTimeout(() => setModal({ show: false, message: "", type: "" }), 2000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://shippinganddelivery.runasp.net/api/users/verify-otp",
        {
          email,
          otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setModal({
        show: true,
        message: response.data?.message || "OTP verified successfully!",
        type: "success",
      });

      setTimeout(() => {
        setModal({ show: false, message: "", type: "" });
        navigate("/reset-password");
      }, 1500);
    } catch (error) {
      setModal({
        show: true,
        message:
          error.response?.data?.message || "Invalid code. Please try again.",
        type: "error",
      });

      setTimeout(() => {
        setModal({ show: false, message: "", type: "" });
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="left-side">
        <img src={`${process.env.PUBLIC_URL}/ship-smart.jpg`} alt="illustration logo" className="logo" />
<img src={`${process.env.PUBLIC_URL}/boy.png`} alt="illustration" className="illustration" />

      </div>

      <div className="right-side">
        <form onSubmit={handleSubmit}>
          <h2>Verify OTP</h2>
          <label>Enter the code sent to your email</label>
          <input
            type="text"
            placeholder="Enter 4-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
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

export default VerifyOtp;
