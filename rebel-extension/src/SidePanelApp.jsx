import "./SidePanelApp.css";
import LoginButton from "./components/LoginButton";
import AccordionMenu from "./components/AccordionMenu";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";
import DailyOrWeeklyPanel from "./components/DailyOrWeeklyPanel";
import { useEffect } from "react"

/**
 * Side Panel UI Layout for the Chrome Extension.
 */
function SidePanelApp() {
  const isAuthenticated = useAuth();

  useEffect(() => {
    // Initial load
    chrome.storage.sync.get("backgroundColor", (data) => {
      const color = data.backgroundColor || "#8b0000";
      document.documentElement.style.setProperty("--app-background", color);
      document.body.style.backgroundColor = color;
    });
  
    // Listen for color update messages
    const handleColorUpdate = (msg) => {
      if (msg.type === "COLOR_UPDATED") {
        document.documentElement.style.setProperty("--app-background", msg.color);
        document.body.style.backgroundColor = msg.color;
      }
    };
  
    chrome.runtime.onMessage.addListener(handleColorUpdate);
  
    // Cleanup
    return () => {
      chrome.runtime.onMessage.removeListener(handleColorUpdate);
    };
  }, []);
  

  return (
    <>
      <AccordionMenu />
    </>
  );
}

export default SidePanelApp;
