import useApplyBackgroundColor from "../hooks/useApplyBackgroundColor";
import './css/ColorPicker.css'
import ThemeCard from "./ThemeCard"; 
import { THEMES } from "../hooks/useApplyBackgroundColor"; 


// MOVED GEE'S COLOR PICKER TO THIS COMPONENT. PLEASE UPDATE ACCORDINGLY

function ColorPicker() {
  const {
    selectedColor,
    handleColorChange,
    handleResetColor,
    handleThemeSelection,
    themeKey,
  } = useApplyBackgroundColor();

  return (
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

        <div className="theme-card-container">
          {Object.entries(THEMES).map(([key, { background, text }]) => (
            <ThemeCard
              key={key}
              themeKey={key}
              background={background}
              text={text}
              isActive={themeKey === key}
              onClick={() => handleThemeSelection(key)}
            />
          ))}
        </div>


       
      </div>
  );
}

export default ColorPicker;