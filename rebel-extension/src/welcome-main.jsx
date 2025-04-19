/**
 * welcome-main.jsx
 *
 * Entry point for the Rebel Remind onboarding flow.
 * This file mounts the welcome/setup interface as a standalone view within the extension.
 *
 * 📦 Components Rendered:
 * - <Welcome />: Initial landing page after installation
 * - <PreferencesSetup />: Guided preferences configuration screen
 * - <GetStarted />: Final setup instructions for pinning and launching the extension
 *
 * 🛣️ Routing:
 * - "/" → Welcome page
 * - "/setup-preferences" → Preferences configuration
 * - "/get-started" → Setup completion guide
 *
 * 🔧 Uses:
 * - React 18 `createRoot`
 * - `HashRouter` for routing inside Chrome Extension environment (no server required)
 *
 * Authored by: Sebastian Yepez  
 * Documentation generated by ChatGPT
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/WelcomePage";
import PreferencesSetup from "./pages/PreferencesSetup";
import GetStarted from "./pages/GetStarted";

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/setup-preferences" element={<PreferencesSetup />} />
      <Route path="/get-started" element={<GetStarted />} />
    </Routes>
  </HashRouter>
);
