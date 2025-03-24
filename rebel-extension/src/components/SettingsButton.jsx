// src/components/SettingsButton.jsx

import React, { useState } from "react";
import "./SettingsButtonCSS.css"; // Import styles for SettingsButton

const SettingsButton = () => {
  const [showSettings, setShowSettings] = useState(false);

  // Toggle visibility of settings options
  const toggleSettings = () => setShowSettings(!showSettings);

  return (
    <div className="settings-button-container">
      <button className="settings-button" onClick={toggleSettings}>
        ⚙️
      </button>
      {showSettings && (
        <div className="settings-options">
          <button>Change Color</button>
          <button>Change Font</button>
        </div>
      )}
    </div>
  );
};

export default SettingsButton;
