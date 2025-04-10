import React, { useEffect, useState } from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SettingPage from "./pages/SettingPage";
import PomodoroPage from "./pages/Pomodoro";
import useApplyBackgroundColor from "./hooks/useApplyBackgroundColor";
import UserEventsPage from "./pages/UserEventsPage";


function App() {
  useApplyBackgroundColor();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["isRunning"], (result) => {
      if (result.isRunning) {
        setShouldRedirect(true);
      }
      setChecked(true);
    });
  }, []);

  if (!checked) {
    // Wait until chrome.storage check finishes
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={shouldRedirect ? <Navigate to="/pomodoro" /> : <HomePage />}
        />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/user-events" element={<UserEventsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
