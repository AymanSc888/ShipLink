import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "./CompanyContext";
import Sidebar from "./CompanySidebar";
import "../CompanyCreateStyles/Second.css";

function Documents() {
  const navigate = useNavigate();
  const { companyData, setCompanyData } = useCompany();

  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setCompanyData({ ...companyData, [name]: files[0] });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!companyData.logo) newErrors.logo = "Logo file is required";
    if (!companyData.license) newErrors.license = "License file is required";
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    navigate("/fourth");
  };

  return (
    <div className="Documents-container">
      <Sidebar />
      <div className="content">
        <h2>Upload Documents</h2>

        <div className="input-group">
          <label htmlFor="logo">Company Logo</label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
            className={errors.logo ? "error" : ""}
          />
          {errors.logo && <p className="error-text">{errors.logo}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="license">Company License</label>
          <input
            type="file"
            id="license"
            name="license"
            accept=".pdf,.doc,.docx,image/*"
            onChange={handleFileChange}
            className={errors.license ? "error" : ""}
          />
          {errors.license && <p className="error-text">{errors.license}</p>}
        </div>

        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default Documents;
