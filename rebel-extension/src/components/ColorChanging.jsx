import useApplyBackgroundColor from "../hooks/useApplyBackgroundColor";
import './css/ColorPicker.css'

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

      <div className="theme-selector" style={{ marginTop: "1rem" }}>
        <label className="settings-label">Pick a preset theme:</label>
        <select
          onChange={(e) => handleThemeSelection(e.target.value)}
          value={themeKey}
          className="reset-button"
        >
          <option value="scarletGray">Scarlet &amp; Gray</option>
          <option value="blackRed">Black &amp; Red</option>
        </select>
      </div>
    </div>
  );
}

export default ColorPicker;