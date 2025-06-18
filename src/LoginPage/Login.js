import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "../LoginStyles/Login.css";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const Login = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return Date.now() > decoded.exp * 1000;
    } catch {
      return true;
    }
  };


  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));

    if (storedUser?.token) {
      if (isTokenExpired(storedUser.token)) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        setModal({
          show: true,
          message: "Session expired. Please log in again.",
          type: "error",
        });
      } else {
        const role = storedUser.role;
        if (role === "Admin") {
          navigate("/dashboard-admin");
        } else if (role === "CompanyOwner") {
          if (storedUser.companyId) {
            navigate(`/dashboard-company/${storedUser.companyId}`);
          } else {
            navigate("/dashboard-company");
          }
        }
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://shippinganddelivery.runasp.net/api/users/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      const token = response?.data?.data?.token;

      if (!token) throw new Error("No token received from server");

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        throw new Error("Invalid token received from server");
      }

      const role = decoded[ROLE_CLAIM] || "Unknown";

      const userData = {
        token,
        email: response.data.data.email,
        fullName: response.data.data.fullName,
        phoneNumber: response.data.data.phoneNumber,
        role,
      };

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      setModal({ show: true, message: "Login successful!", type: "success" });
    } catch (error) {
      const fallback = "Login failed. Please check your credentials.";
      let message = fallback;

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          fallback;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setModal({ show: true, message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal.show && modal.type === "success") {
      timeoutRef.current = setTimeout(() => {
        const stored =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        const role = stored?.role;

        if (role === "Admin") {
          navigate("/dashboard-admin");
        } else if (role === "CompanyOwner") {
          if (stored?.companyId) {
            navigate(`/dashboard-company/${stored.companyId}`);
          } else {
            navigate("/dashboard-company");
          }
        }
      }, 1500);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [modal, navigate]);

  useEffect(() => {
    if (modal.show) {
      const timer = setTimeout(() => setModal({ ...modal, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [modal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <img src="/ship-smart.jpg" alt="Shipping Logo" className="logo" />
        <img src="/Truck.png" alt="Shipping Truck" className="truck-image" />
        <h5 className="tagline">"Ship smarter, ship faster"</h5>
      </div>

      <div className="right-side">
        <div className="login-box">
          <h2>Login</h2>
          <p>Please log in if you already have an account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container" style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="show-password-btn"
                  style={{
                    position: "absolute",
                    right: "0",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#007BFF",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-options" style={{ position: "relative" }}>
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>

              <Link
                to="/forget-password"
                className="forgot-password"
                style={{
                  position: "absolute",
                  right: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>

      {modal.show && (
        <div className="modal-overlay" role="alert" aria-live="assertive">
          <div className={`modal-box ${modal.type}`} tabIndex="-1">
            <p>{modal.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
