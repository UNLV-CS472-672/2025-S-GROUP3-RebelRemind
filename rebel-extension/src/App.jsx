import React, { useEffect, useState } from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import PomodoroPage from "./pages/Pomodoro";
import useApplyBackgroundColor from "./hooks/useApplyBackgroundColor";
import UserEventsPage from "./pages/UserEventsPage";
import WelcomePage from "./pages/WelcomePage";


function App() {
  useApplyBackgroundColor();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [checked, setChecked] = useState(false);
  const [bypass, setBypass] = useState(false);
  const handleBypass = (bypass) => {
    if (!bypass)
      {
        setBypass(true);
      }
  };
  
  useEffect(() => {
    chrome.storage.local.get(["isRunning"], (result) => {
      //if (!bypass){
        //setBypass(true);
      //}
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
          element={ ( shouldRedirect && bypass ) ? <Navigate to="/pomodoro" />  : <HomePage /> }
        />
        {handleBypass}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/user-events" element={<UserEventsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
