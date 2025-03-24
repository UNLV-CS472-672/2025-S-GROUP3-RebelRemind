import "./css/SettingPage.css";
import LoginButton from "../components/LoginButton";
import UserProfile from "../components/UserProfile";
import useAuth from "../../public/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SettingPage() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState("crimson");

  // Load stored color from chrome.storage.sync
  useEffect(() => {
    chrome.storage.sync.get("backgroundColor", (data) => {
      if (data.backgroundColor) {
        setSelectedColor(data.backgroundColor);
        document.documentElement.style.setProperty("--app-background", data.backgroundColor);
        document.body.style.backgroundColor = data.backgroundColor;
      }
    });
  }, []);

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    chrome.storage.sync.set({ backgroundColor: newColor });
    document.documentElement.style.setProperty("--app-background", newColor);
    document.body.style.backgroundColor = newColor;
  
    // Notify side panel (and any other listeners)
    chrome.runtime.sendMessage({ type: "COLOR_UPDATED", color: newColor });
  };
  

  return (
    <>
      <button onClick={() => navigate("/")}>⬅️ Back</button>
      
      <div className="settings-section">
        <h2 className="settings-title">🎨 Customize Your Background</h2>
        <label htmlFor="colorPicker" className="settings-label">
          Choose your background color:
        </label>
        <input
          id="colorPicker"
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          className="color-picker-input"
        />
      </div>

      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </>
  );
}

export default SettingPage;
