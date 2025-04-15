import React from "react";
import "../components/css/ColorPicker.css"; 

const ThemeCard = ({ themeKey, background, text, isActive, onClick }) => {
  return (
    <div
      className={`theme-card ${isActive ? "active" : ""}`}
      style={{ backgroundColor: background, color: text }}
      onClick={onClick}
    >
      <div className="theme-label">{themeKey}</div>
    </div>
  );
};

export default ThemeCard;
