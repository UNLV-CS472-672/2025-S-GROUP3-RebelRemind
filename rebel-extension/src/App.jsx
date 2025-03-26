import React from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SettingPage from "./pages/SettingPage";
import useApplyBackgroundColor from "./hooks/useApplyBackgroundColor";
import UserEventsPage from "./pages/UserEventsPage"

/**
 * Main UI Layout for the Chrome Extension.
 */
function App() {
  useApplyBackgroundColor();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/user-events" element={<UserEventsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
