import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./sidepanel-index.css";
import SidePanelApp from "./SidePanelApp.jsx";

/* Entry Point of the React SidePanelApp */

createRoot(document.getElementById("sidepanel-root")).render(
  <StrictMode>
    <SidePanelApp />
  </StrictMode>
);
