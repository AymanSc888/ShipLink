import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "./CompanyContext";
import "../CompanyCreateStyles/First.css";
import Sidebar from "./CompanySidebar";

function First() {
  const navigate = useNavigate();
  const { companyData, setCompanyData } = useCompany();
  
  // حالة لتخزين الأخطاء
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });

    // لما المستخدم يبدأ يكتب في الحقل، نشيل الخطأ عن الحقل ده
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!companyData.companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!companyData.mainLocation.trim()) newErrors.mainLocation = "Main Location is required";
    if (!companyData.email.trim()) newErrors.email = "Email is required";
    if (!companyData.phone.trim()) newErrors.phone = "Phone is required";
    if (!companyData.zipCode.trim()) newErrors.zipCode = "ZIP Code is required";
    if (!companyData.manager.trim()) newErrors.manager = "Manager is required";
    if (!companyData.taxNumber.trim()) newErrors.taxNumber = "Tax Number is required";

    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // يمنع التنقل لو في أخطاء
    }
    navigate("/second");
  };

  return (
    <div className="First-container">
      <Sidebar />
      <div className="content">
        <h2>Company Information</h2>
        
        <div className="input-group">
          <input
            className={errors.companyName ? "error" : ""}
            name="companyName"
            value={companyData.companyName}
            onChange={handleChange}
            placeholder="Company Name"
          />
          {errors.companyName && <p className="error-text">{errors.companyName}</p>}
        </div>

        <div className="input-group">
          <input
            className={errors.mainLocation ? "error" : ""}
            name="mainLocation"
            value={companyData.mainLocation}
            onChange={handleChange}
            placeholder="Main Location"
          />
          {errors.mainLocation && <p className="error-text">{errors.mainLocation}</p>}
        </div>

        <div className="input-group">
          <input
            className={errors.email ? "error" : ""}
            name="email"
            value={companyData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="input-group">
          <input
            className={errors.phone ? "error" : ""}
            name="phone"
            value={companyData.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>


        <div className="input-group">
          <input
            className={errors.zipCode ? "error" : ""}
            name="zipCode"
            value={companyData.zipCode}
            onChange={handleChange}
            placeholder="ZIP Code"
          />
          {errors.zipCode && <p className="error-text">{errors.zipCode}</p>}
        </div>

        <div className="input-group">
          <input
            className={errors.manager ? "error" : ""}
            name="manager"
            value={companyData.manager}
            onChange={handleChange}
            placeholder="Manager"
          />
          {errors.manager && <p className="error-text">{errors.manager}</p>}
        </div>

        <div className="input-group">
          <input
            className={errors.taxNumber ? "error" : ""}
            name="taxNumber"
            value={companyData.taxNumber}
            onChange={handleChange}
            placeholder="Tax Number"
          />
          {errors.taxNumber && <p className="error-text">{errors.taxNumber}</p>}
        </div>

        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default First;
