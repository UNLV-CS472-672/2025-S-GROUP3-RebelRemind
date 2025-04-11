// src/pages/PreferencesSetup.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Preferences from "../components/Preferences.jsx";
import UserProfile from "../components/UserProfile";
import LoginButton from "../components/LoginButton";
import useAuth from "../../public/hooks/useAuth";
import "./css/PreferencesSetup.css"

const PreferencesSetup = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuth(); // Determines if user is logged in

    const handleFinish = () => {
        // 1. Open main extension page (like a dashboard or your popup's logic in tab form)
        // chrome.tabs.create({ url: "chrome://newtab/" }); // open new tab
        chrome.tabs.create({ url: chrome.runtime.getURL("index.html") }); // open extension as a new tab
      
        // 2. Close current tab (assuming it's a chrome-extension:// tab)
        chrome.tabs.getCurrent((tab) => {
          if (tab?.id) {
            chrome.tabs.remove(tab.id);
          }
        });
      };      

    return (
        isAuthenticated ?
            <div className="page-background-pref">
                <div className="preferences-container">
                    <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>🛠️ Setup Your Rebel Remind Preferences</h1>
                    <p style={{ textAlign: "center", color: "#555", marginBottom: "2rem" }}>
                        Select what you'd like Rebel Remind to notify you about. You can change these anytime!
                    </p>

                    {/* Preferences component */}
                    <Preferences setupMode={true} />

                    <p style={{ marginBottom: "1rem" }}>All done? Let's go!</p>
                    <button
                        onClick={handleFinish}
                        className="bt"
                    >
                        Finish Setup
                    </button>
                </div>
            </div>
            :
            <>
                <div className="page-background">
                    <div className="welcome-container">
                        <h1>🛑 Before we get started...</h1>
                        <h3>Please login with Google. This will help us confirm you are a UNLV student and be used for future integrations.</h3>
                        <LoginButton />
                    </div>
            </div >
            </>
    );
};

export default PreferencesSetup;
