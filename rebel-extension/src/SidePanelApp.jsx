import "./SidePanelApp.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";
import CalendarView from "./components/CalendarView";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";

/**
 * Side Panel UI Layout for the Chrome Extension.
 */
function SidePanelApp() {
  const isAuthenticated = useAuth();

  return (
    <div>
      <CalendarView />
    </div>
  );
}

export default SidePanelApp;
