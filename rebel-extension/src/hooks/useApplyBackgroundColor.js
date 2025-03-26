import { useEffect, useState } from "react";

const DEFAULT_COLOR = "#dc143c"; 

const useApplyBackgroundColor = () => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  // Apply a gradient based on the base color
  const applyColor = (baseColor) => {
    const gradient = `linear-gradient(to bottom right, ${baseColor}, #f8d7da)`;
    document.documentElement.style.setProperty("--app-background", gradient);
    document.body.style.background = gradient;
  };

  // Load saved color from chrome storage and apply it
  useEffect(() => {
    chrome.storage.sync.get("backgroundColor", (data) => {
      const baseColor = data.backgroundColor || DEFAULT_COLOR;
      setSelectedColor(baseColor);     // for input
      applyColor(baseColor);           // for background
    });
  }, []);

  // When user picks a new color
  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    chrome.storage.sync.set({ backgroundColor: newColor });
    applyColor(newColor);
    chrome.runtime.sendMessage({ type: "COLOR_UPDATED", color: newColor });
  };

  // Reset to default
  const handleResetColor = () => {
    setSelectedColor(DEFAULT_COLOR);
    chrome.storage.sync.set({ backgroundColor: DEFAULT_COLOR });
    applyColor(DEFAULT_COLOR);
    chrome.runtime.sendMessage({ type: "COLOR_UPDATED", color: DEFAULT_COLOR });
  };

  return { selectedColor, handleColorChange, handleResetColor };
};

export default useApplyBackgroundColor;
