import React, { useState } from "react";
import "./SettingsButton.css";

const SettingsButton = ({ setColor }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("crimson");  // Match default color

  // Toggle visibility of settings options
  const toggleSettings = () => setShowSettings(!showSettings);

  // Handle color change
  const handleColorChange = (event) => {
    const color = event.target.value;
    setSelectedColor(color);  // Set the selected color
    setColor(color);           // Update the background color in App.jsx
  };

  // Toggle the color picker visibility
  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  return (
    <div className="settings-button-container">
      <button className="settings-button" onClick={toggleSettings}>
        ⚙️
      </button>
      {showSettings && (
        <div className="settings-options">
          <button onClick={toggleColorPicker}>Change Color</button>
          {showColorPicker && (
            <input
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              title="Choose your color"
              style={{ width: "40px", height: "40px", border: "none" }}
            />
          )}
          <button>Change Font</button>
        </div>
      )}
    </div>
  );
};

export default SettingsButton;
