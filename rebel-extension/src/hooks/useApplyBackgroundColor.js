import { useEffect, useState } from "react";

const DEFAULT_COLOR = "#8b0000";

const useApplyBackgroundColor = () => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  // Apply color to document
  const applyColor = (color) => {
    document.documentElement.style.setProperty("--app-background", color);
    document.body.style.backgroundColor = color;
  };

  // Load color on mount
  useEffect(() => {
    chrome.storage.sync.get("backgroundColor", (data) => {
      const color = data.backgroundColor || DEFAULT_COLOR;
      setSelectedColor(color);
      applyColor(color);
    });
  }, []);

  // Update color
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
