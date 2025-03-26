import { useEffect, useState } from "react";

const DEFAULT_COLOR = "linear-gradient(to bottom right, #dc143c, #f8d7da)";

const useApplyBackgroundColor = () => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  // Apply color to document
  const applyColor = (color) => {
    const gradient = `linear-gradient(to bottom right, ${color}, #f8d7da)`;
    document.documentElement.style.setProperty("--app-background", gradient);
    document.body.style.background = gradient;
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
