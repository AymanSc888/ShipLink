import { useCompany } from "./CompanyContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./CompanySidebar";
import "../CompanyCreateStyles/Fifth.css";

function PasswordSetup() {
  const { companyData, setCompanyData } = useCompany();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!companyData.password || companyData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("Name", companyData.companyName);
    formData.append("Email", companyData.email);
    formData.append("PhoneNumber", companyData.phone);
    formData.append("MainAddress", companyData.mainLocation);
    formData.append("ZipCode", companyData.zipCode);
    formData.append("TaxNumber", companyData.taxNumber);
    formData.append("ResponsibleManger", companyData.manager);

    formData.append(
      "WorkTime",
      companyData.workTime ? companyData.workTime + ":00" : ""
    );

    if (companyData.logo) formData.append("Logo", companyData.logo);
    if (companyData.license)
      formData.append("TradeLicense", companyData.license);
    if (companyData.photo) formData.append("Photos", companyData.photo);

    formData.append("About", companyData.aboutCompany || "");
    formData.append("Description", companyData.description || "");
    formData.append("Advantages", companyData.advantages || "");
    formData.append("Disadvantages", companyData.disadvantages || "");
    formData.append("Password", companyData.password);

    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    const token = user?.token;

    if (!token) {
      setError("User is not authenticated. No token found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://shippinganddelivery.runasp.net/api/companies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error submitting data: ${errorText}`);
      }

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/companies", { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const workTimeOptions = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  return (
    <div className="PasswordSetup-container">
      <Sidebar />
      <div className="password-form">
        <h2>Set Company Password</h2>

        <input
          type="password"
          name="password"
          value={companyData.password || ""}
          onChange={(e) =>
            setCompanyData({ ...companyData, password: e.target.value })
          }
          placeholder="Enter a secure password"
        />

        <select
          value={companyData.workTime || ""}
          onChange={(e) =>
            setCompanyData({ ...companyData, workTime: e.target.value })
          }
        >
          <option value="">Select Work Time</option>
          {workTimeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        {error && <p className="error">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Company Created Successfully!</h3>
              <p>You can now log in using your email and password.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PasswordSetup;
