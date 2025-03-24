import React, { useState, useEffect } from "react";
import "./App.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";
import ChangeMenu from "./components/ChangeMenu";
import CalendarMenu from "./components/CalendarMenu";
import CloseButton from "./components/CloseButton";  // Keep the X button
import CanvasLogin from "./components/CanvasLogin";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";
import SettingsButton from "./components/SettingsButton";

/**
 * Main UI Layout for the Chrome Extension.
 */
function App() {
  const isAuthenticated = useAuth();
  
  // Use crimson as the default color
  const [backgroundColor, setBackgroundColor] = useState(
    localStorage.getItem("backgroundColor") || "crimson"
  );

  // Set the background color globally
  useEffect(() => {
    document.documentElement.style.setProperty("--app-background", backgroundColor);
    document.body.style.backgroundColor = backgroundColor;  
    localStorage.setItem("backgroundColor", backgroundColor); 
  }, [backgroundColor]);

  return (
    <div
      style={{
        position: "relative",
        padding: "10px",
        color: "white",
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
        backgroundColor: backgroundColor,  // Ensure the background color applies here
      }}
    >
      <CloseButton /> 

      <SettingsButton setColor={setBackgroundColor} />
      
      <Counter />
      <AccordionMenu />
      <ChangeMenu />
      <CanvasLogin />
      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </div>
  );
}

export default App;
