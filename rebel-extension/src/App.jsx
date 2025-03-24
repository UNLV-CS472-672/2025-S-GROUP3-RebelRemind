import React, { useEffect } from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SettingPage from "./pages/SettingPage";

function App() {
  // Load saved color on extension open
  useEffect(() => {
    chrome.storage.sync.get("backgroundColor", (data) => {
      const color = data.backgroundColor || "crimson";
      document.documentElement.style.setProperty("--app-background", color);
      document.body.style.backgroundColor = color;
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
