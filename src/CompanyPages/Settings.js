import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../CompanyStyles/Settings.css";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("Light");
  const [timeZone, setTimeZone] = useState("GMT");
  const [profileImage, setProfileImage] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showModal, setShowModal] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://shippinganddelivery.runasp.net/api/users/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        const u = data.data || data;
        setEmail(u.email || "");
        setCompanyName(u.companyName || "");
        setLanguage(u.language || "en");
        setNotifications(!!u.notifications);
        setTheme(u.theme || "Light");
        setTimeZone(u.timeZone || "GMT");
        setProfileImage(u.profileImage || null);
      } catch (e) {
        console.error(e);
      }
    };
    if (token) fetchSettings();
  }, [token]);

  const handleSave = async () => {
    try {
      const res = await fetch("http://shippinganddelivery.runasp.net/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          companyName,
          notifications,
          language,
          theme,
          timeZone,
          profileImage,
        }),
      });
      if (!res.ok) throw new Error();
      setSaveMessage("✅ Settings saved successfully");
    } catch {
      setSaveMessage("❌ Failed to save settings");
    } finally {
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      const r = new FileReader();
      r.onloadend = () => setProfileImage(r.result);
      r.readAsDataURL(f);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("❌ Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://shippinganddelivery.runasp.net/api/users/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        alert("✅ Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowModal(null);
      } else {
        alert("❌ Failed to change password");
      }
    } catch {
      alert("❌ Something went wrong");
    }
  };

  return (
    <div className="settings-page">
      <Sidebar />
      <main className="content">
        <h1 className="title">Settings</h1>

        <section className="settings-section">
          <h2 onClick={() => setShowModal("account")}>Account</h2>
        </section>
        <section className="settings-section">
          <h2 onClick={() => setShowModal("security")}>Security</h2>
        </section>
        <section className="settings-section">
          <h2 onClick={() => setShowModal("preferences")}>Preferences</h2>
        </section>

        <button className="save-btn" onClick={handleSave}>
          Save Settings
        </button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}

        {showModal && (
          <div className="custom-modal-overlay" onClick={() => setShowModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {showModal === "account" && (
                <div className="modal-body">
                  <h3>Account Settings</h3>
                  <div className="setting-item">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="setting-item">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="setting-item">
                    <label>Profile Image</label>
                    <input type="file" onChange={handleImageChange} />
                  </div>
                  {profileImage && <img src={profileImage} alt="Profile" className="preview-img" />}
                  <button className="close-btn" onClick={() => setShowModal(null)}>Close</button>
                </div>
              )}

              {showModal === "security" && (
                <div className="modal-body">
                  <h3>Change Password</h3>
                  <div className="setting-item">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="setting-item">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="setting-item">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button className="save-btn" onClick={handlePasswordChange}>Update Password</button>
                  <button className="close-btn" onClick={() => setShowModal(null)}>Close</button>
                </div>
              )}

              {showModal === "preferences" && (
                <div className="modal-body">
                  <h3>Preferences Settings</h3>
                  <div className="setting-item toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                      />
                      Enable Notifications
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>Language</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Theme</label>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System Default</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Time Zone</label>
                    <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                      <option>GMT</option>
                      <option>GMT+2 (Cairo)</option>
                      <option>GMT+3 (Riyadh)</option>
                      <option>GMT+4 (Dubai)</option>
                    </select>
                  </div>
                  <button className="close-btn" onClick={() => setShowModal(null)}>Close</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
