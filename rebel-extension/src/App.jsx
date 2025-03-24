import React, { useState, useEffect } from "react";
import "./App.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";
import ChangeMenu from "./components/ChangeMenu";
import CalendarMenu from "./components/CalendarMenu";
import CloseButton from "./components/CloseButton";
import CanvasLogin from "./components/CanvasLogin";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";
import SettingsButton from "./components/SettingsButton";

/**
 * Main UI Layout for the Chrome Extension.
 */
function App() {
  const isAuthenticated = useAuth();
  const [backgroundColor, setBackgroundColor] = useState("crimson");  // Default background color

  // Set background color globally when it changes
  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;  // Update body background color
    document.body.style.setProperty('--app-background', backgroundColor);  // Set a global CSS variable for background
  }, [backgroundColor]);

  return (
    <div
      style={{
        position: "relative",
        padding: "10px",
        color: "white",
      }}
    >
      <CloseButton /> {/* Close Button */}
      <SettingsButton setColor={setBackgroundColor} /> {/* Pass setColor as prop */}
      
      <Counter />
      <AccordionMenu />
      <ChangeMenu />
      <CanvasLogin />
      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </div>
  );
}

export default App;
