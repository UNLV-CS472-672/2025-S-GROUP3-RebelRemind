import { useEffect, useState } from "react";

const DEFAULT_COLOR = "#dc143c";
const DEFAULT_TEXT = "#ffffff";

export const THEMES = {
  scarletGray: {
    background: "#BB0000",
    text: "#d3d3d3",
  },
  blackRed: {
    background: "#000000",
    text: "#ff1c1c",
  },
  sunset: {
    background: "#ff7e5f",
    text: "#2d2d2d",
  },
  ocean: {
    background: "#2E8BC0",
    text: "#ffffff",
  },
  lavenderDream: {
    background: "#b57edc",
    text: "#ffffff",
  },
  forest: {
    background: "#228B22",
    text: "#e6ffe6",
  },
  peachy: {
    background: "#FFDAB9",
    text: "#5a2e2e",
  },
  cottonCandy: {
    background: "#ffb6c1",
    text: "#5b5b5b",
  },
  sebastianPick: {
    background: "rgb(26, 33, 255)",
    text: "#ffffff",
  }
};


const useApplyBackgroundColor = () => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT);
  const [themeKey, setThemeKey] = useState("custom");

  const applyColor = (bg, text) => {
    const gradient = `linear-gradient(to bottom right, ${bg}, #f8d7da)`;
    document.documentElement.style.setProperty("--app-background", gradient);
    document.documentElement.style.setProperty("--app-text-color", text);
    document.body.style.background = gradient;
    document.body.style.color = text;
  };

  useEffect(() => {
    chrome.storage.sync.get(
      ["backgroundColor", "textColor", "selectedThemeKey"],
      (data) => {
        const baseColor = data.backgroundColor || DEFAULT_COLOR;
        const txtColor = data.textColor || DEFAULT_TEXT;
        const theme = data.selectedThemeKey || "custom";
        setSelectedColor(baseColor);
        setTextColor(txtColor);
        setThemeKey(theme);
        applyColor(baseColor, txtColor);
      }
    );
  }, []);

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    setTextColor(DEFAULT_TEXT);
    setThemeKey("custom");

    chrome.storage.sync.set({
      backgroundColor: newColor,
      textColor: DEFAULT_TEXT,
      selectedThemeKey: "custom",
    });

    applyColor(newColor, DEFAULT_TEXT);
    chrome.runtime.sendMessage({
      type: "COLOR_UPDATED",
      color: newColor,
      textColor: DEFAULT_TEXT,
    });
  };

  const handleResetColor = () => {
    setSelectedColor(DEFAULT_COLOR);
    setTextColor(DEFAULT_TEXT);
    setThemeKey("custom");

    chrome.storage.sync.set({
      backgroundColor: DEFAULT_COLOR,
      textColor: DEFAULT_TEXT,
      selectedThemeKey: "custom",
    });

    applyColor(DEFAULT_COLOR, DEFAULT_TEXT);
    chrome.runtime.sendMessage({
      type: "COLOR_UPDATED",
      color: DEFAULT_COLOR,
      textColor: DEFAULT_TEXT,
    });
  };

  const handleThemeSelection = (newKey) => {
    setThemeKey(newKey);
    const theme = THEMES[newKey];
    if (theme) {
      setSelectedColor(theme.background);
      setTextColor(theme.text);
      chrome.storage.sync.set({
        backgroundColor: theme.background,
        textColor: theme.text,
        selectedThemeKey: newKey,
      });
      applyColor(theme.background, theme.text);
      chrome.runtime.sendMessage({
        type: "COLOR_UPDATED",
        color: theme.background,
        textColor: theme.text,
      });
    }
  };

  return {
    selectedColor,
    textColor,
    themeKey,
    handleColorChange,
    handleResetColor,
    handleThemeSelection,
  };
};

export default useApplyBackgroundColor;
