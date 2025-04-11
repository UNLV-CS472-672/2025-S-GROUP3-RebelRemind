import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/WelcomePage.css";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="page-background">
      <div className="welcome-container">
        <h1>🎉 Welcome to Rebel Remind!</h1>
        <h3>Thanks for installing the extension. Let’s get started!</h3>
        <button onClick={() => navigate("/setup-preferences")}>Get Started</button>
      </div>
    </div>
  );
};

export default Welcome;
