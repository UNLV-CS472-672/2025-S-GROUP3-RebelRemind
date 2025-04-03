// /src/hooks/useApplyBackgroundColor.js
import { useEffect, useState } from "react";

// Keep your default color as is:
const DEFAULT_COLOR = "#dc143c";
// Add a default text color (white is typical):
const DEFAULT_TEXT = "#ffffff";

// Predefined themes for easy switching:
const THEMES = {
  default: {
    background: "#8b0000",
    text: "#ffffff",
  },
  scarletGray: {
    // background: "Scarlet", text: "Gray"
    background: "#BB0000",
    text: "#d3d3d3",
  },
  blackRed: {
    // background: "Black", text: "Red"
    background: "#000000",
    text: "#ff1c1c",
  },
};

const useApplyBackgroundColor = () => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  // NEW: track a separate text color
  const [textColor, setTextColor] = useState(DEFAULT_TEXT);

  // This applies both the gradient background and the text color:
  const applyColor = (baseColor, txtColor) => {
    // Your existing gradient logic:
    const gradient = `linear-gradient(to bottom right, ${baseColor}, #f8d7da)`;

    // Set them as CSS variables:
    document.documentElement.style.setProperty("--app-background", gradient);
    document.documentElement.style.setProperty("--app-text-color", txtColor);

    // Or directly override the body if you prefer:
    document.body.style.background = gradient;
    document.body.style.color = txtColor;
  };

  // Load saved color + text from storage on mount:
  useEffect(() => {
    chrome.storage.sync.get(["backgroundColor", "textColor"], (data) => {
      const baseColor = data.backgroundColor || DEFAULT_COLOR;
      const txtColor = data.textColor || DEFAULT_TEXT;
      setSelectedColor(baseColor);
      setTextColor(txtColor);
      applyColor(baseColor, txtColor);
    });
  }, []);

  // Called when user picks a single color from <input type="color">
  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    // Save new color (but keep the same text color we already have):
    chrome.storage.sync.set({ backgroundColor: newColor, textColor });
    applyColor(newColor, textColor);
    chrome.runtime.sendMessage({ type: "COLOR_UPDATED", color: newColor });
  };

  // Reset to your original defaults
  const handleResetColor = () => {
    setSelectedColor(DEFAULT_COLOR);
    setTextColor(DEFAULT_TEXT);
    chrome.storage.sync.set({
      backgroundColor: DEFAULT_COLOR,
      textColor: DEFAULT_TEXT,
    });
    applyColor(DEFAULT_COLOR, DEFAULT_TEXT);
    chrome.runtime.sendMessage({ type: "COLOR_UPDATED", color: DEFAULT_COLOR });
  };

  // NEW: let user pick from your predefined themes
  const setTheme = (themeKey) => {
    const theme = THEMES[themeKey];
    if (!theme) return; // do nothing if invalid key
    setSelectedColor(theme.background);
    setTextColor(theme.text);
    chrome.storage.sync.set({
      backgroundColor: theme.background,
      textColor: theme.text,
    });
    applyColor(theme.background, theme.text);
  };

  return {
    selectedColor,
    textColor,
    handleColorChange,
    handleResetColor,
    setTheme,
  };
};

export default useApplyBackgroundColor;
