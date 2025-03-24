import React, { useState } from "react";
import "./SettingsButtonCSS.css";

const SettingsButton = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false); // Added state to control color picker visibility
  const [selectedColor, setSelectedColor] = useState("#ffffff"); // Default color

  // Toggle visibility of settings options
  const toggleSettings = () => setShowSettings(!showSettings);

  // Handle color change
  const handleColorChange = (event) => {
    setSelectedColor(event.target.value); // Set the selected color
    document.body.style.backgroundColor = event.target.value; // Change background color
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
