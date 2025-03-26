import "./css/SettingPage.css";
import LoginButton from "../components/LoginButton";
import UserProfile from "../components/UserProfile";
import useAuth from "../../public/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useApplyBackgroundColor from "../hooks/useApplyBackgroundColor";

function SettingPage() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();
  const { selectedColor, handleColorChange, handleResetColor } = useApplyBackgroundColor();

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
      </div>

      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </>
  );
}

export default SettingPage;
