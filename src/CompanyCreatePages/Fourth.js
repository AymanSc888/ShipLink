import { useNavigate } from "react-router-dom";
import { useCompany } from "./CompanyContext";
import Sidebar from "./CompanySidebar";
import "../CompanyCreateStyles/Fourth.css";

function AdditionalInfo() {
  const navigate = useNavigate();
  const { companyData, setCompanyData } = useCompany();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
  };

  const handleFileChange = (e) => {
    setCompanyData({ ...companyData, photo: e.target.files[0] });
  };

  const handleNext = () => {
    navigate("/fifth");
  };

  const handleSkip = () => {
    // ممكن تمسح البيانات أو تخليها زي ما هي، هنا بنروح فوراً للخامس
    navigate("/fifth");
  };

  return (
    <div className="AdditionalInfo-container">
      <Sidebar />
      <div className="content">
        <h2>Additional Info</h2>

        <textarea
          name="aboutCompany"
          value={companyData.aboutCompany || ""}
          onChange={handleChange}
          placeholder="About the company"
          rows={4}
        />

        <textarea
          name="description"
          value={companyData.description || ""}
          onChange={handleChange}
          placeholder="Description"
          rows={4}
        />

        <textarea
          name="advantages"
          value={companyData.advantages || ""}
          onChange={handleChange}
          placeholder="Advantages"
          rows={3}
        />

        <textarea
          name="disadvantages"
          value={companyData.disadvantages || ""}
          onChange={handleChange}
          placeholder="Disadvantages"
          rows={3}
        />

        <label htmlFor="photoUpload" className="file-label">
          Upload a Photo
        </label>
        <input
          type="file"
          id="photoUpload"
          accept="image/*"
          onChange={handleFileChange}
        />

        <div className="buttons-group">
          <button className="btn-next" onClick={handleNext}>
            Next
          </button>
          <button className="btn-skip" onClick={handleSkip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdditionalInfo;
