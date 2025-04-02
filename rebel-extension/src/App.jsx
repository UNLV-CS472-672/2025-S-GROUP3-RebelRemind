import React, { useEffect } from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SettingPage from "./pages/SettingPage";
import PomodoroPage from "./pages/Pomodoro";
import useApplyBackgroundColor from "./hooks/useApplyBackgroundColor";
import UserEventsPage from "./pages/UserEventsPage";

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    chrome.storage.local.get(["isRunning"], (result) => {
      if (result.isRunning) {
        navigate("/pomodoro");
      }
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings" element={<SettingPage />} />
      <Route path="/pomodoro" element={<PomodoroPage />} />
      <Route path="/user-events" element={<UserEventsPage />} />
    </Routes>
  );
}

function App() {
  useApplyBackgroundColor();

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
