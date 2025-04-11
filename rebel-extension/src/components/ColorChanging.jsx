import React, { useState } from "react";
import useApplyBackgroundColor, { THEMES } from "../hooks/useApplyBackgroundColor";
import ThemeCard from "./ThemeCard";
import "./css/ColorPicker.css";

function ColorPicker() {
  const {
    selectedColor,
    handleColorChange,
    handleResetColor,
    handleThemeSelection,
    themeKey,
  } = useApplyBackgroundColor();

  const [showThemes, setShowThemes] = useState(false);


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

      {/* Collapsible Theme Picker Section */}
      <div className="theme-gallery">
              <div
                className="theme-gallery-header"
                onClick={() => setShowThemes((prev) => !prev)}
              >
                <h3 className="settings-label" style={{ cursor: "pointer" }}>
                  🎨 Choose a Preset Theme {showThemes ? "▾" : "▸"}
                </h3>
              </div>

              {showThemes && (
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
              )}
            </div>
    </div>
  );
}

export default ColorPicker;