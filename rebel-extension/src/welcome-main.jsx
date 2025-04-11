// src/welcome-main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/WelcomePage";
import PreferencesSetup from "./pages/PreferencesSetup";

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/setup-preferences" element={<PreferencesSetup />} />
    </Routes>
  </HashRouter>
);
