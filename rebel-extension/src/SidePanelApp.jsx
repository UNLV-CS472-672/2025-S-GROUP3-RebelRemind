import "./SidePanelApp.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";
import CalendarView from "./components/CalendarView";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";
import { useEffect } from "react"

/**
 * Side Panel UI Layout for the Chrome Extension.
 */
function SidePanelApp() {
  const isAuthenticated = useAuth();

    useEffect(() => {
      const applyGradient = (baseColor) => {
        const gradient = `linear-gradient(to bottom right, ${baseColor}, #f8d7da)`;
        document.documentElement.style.setProperty("--app-background", gradient);
        document.body.style.background = gradient;
      };
    
      chrome.storage.sync.get("backgroundColor", (data) => {
        const color = data.backgroundColor || "#dc143c";
        applyGradient(color);
      });
    
      const handleColorUpdate = (msg) => {
        if (msg.type === "COLOR_UPDATED") {
          applyGradient(msg.color);
        }
      };
    
      chrome.runtime.onMessage.addListener(handleColorUpdate);
    
      return () => {
        chrome.runtime.onMessage.removeListener(handleColorUpdate);
      };
    }, []);
    
    

  return (
    <div>
      <CalendarView />
    </div>
  );
}

export default SidePanelApp;
