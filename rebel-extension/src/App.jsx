import "./App.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";
import ChangeMenu from "./components/ChangeMenu";
import CalendarMenu from "./components/CalendarMenu";
import React from "react";
import CloseButton from "./components/CloseButton";
import CanvasLogin from "./components/CanvasLogin";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";

/**
 * Main UI Layout for the Chrome Extension.
 */
function App() {
  const isAuthenticated = useAuth();

  return (
    <div style={{ position: "relative", padding: "10px", color: "white" }}>
      <CloseButton /> {/* Add Close Button */}
      <Counter />
      <AccordionMenu />
      <ChangeMenu />
    
      <CanvasLogin />
      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </div>
    
  );
}

export default App;
