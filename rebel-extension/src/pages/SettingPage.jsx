// /src/pages/SettingPage.jsx
import "./css/SettingPage.css";
import LoginButton from "../components/LoginButton";
import UserProfile from "../components/UserProfile";
import useAuth from "../../public/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useApplyBackgroundColor from "../hooks/useApplyBackgroundColor";
import { useEffect, useState } from "react";

function SettingPage() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  // Bring in background logic from your custom hook.
  // We'll still use "setTheme" to apply scarletGray or blackRed.
  const {
    selectedColor,
    handleColorChange,
    handleResetColor,
    setTheme,
  } = useApplyBackgroundColor();

  // For remembering which theme is currently picked
  const [themeKey, setThemeKey] = useState("scarletGray"); 

  // On mount, load the saved theme from storage
  useEffect(() => {
    chrome.storage.sync.get("selectedThemeKey", (data) => {
      if (data.selectedThemeKey) {
        setThemeKey(data.selectedThemeKey);
      }
    });
  }, []);

  // Whenever "themeKey" changes, apply that theme
  useEffect(() => {
    setTheme(themeKey);
  }, [themeKey, setTheme]);

  // Handle user picking a theme from the dropdown
  const handleThemeSelection = (e) => {
    const newKey = e.target.value;
    setThemeKey(newKey);
    // Save it so it persists
    chrome.storage.sync.set({ selectedThemeKey: newKey });
  };

  return (
    <>
      <button onClick={() => navigate("/")}>⬅️ Back</button>

      <div className="settings-section">
        <h2 className="settings-title">🎨 Customize Your Background</h2>

        <label htmlFor="colorPicker" className="settings-label">
          Choose your background color:
        </label>
        <div className="color-controls">
          <input
            id="colorPicker"
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            className="color-picker-input"
          />
          <button onClick={handleResetColor} className="reset-button">
            🔄 Back to Original
          </button>
        </div>

        {/* NEW: The theme selector, styled like the "reset-button" */}
        <div className="theme-selector" style={{ marginTop: "1rem" }}>
          <label className="settings-label">Pick a preset theme:</label>
          <select
            onChange={handleThemeSelection}
            value={themeKey}
            className="reset-button"
          >
            <option value="scarletGray">Scarlet &amp; Gray</option>
            <option value="blackRed">Black &amp; Red</option>
          </select>
        </div>
      </div>

      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </>
  );
}

export default SettingPage;
