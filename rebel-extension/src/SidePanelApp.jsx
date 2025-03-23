import "./SidePanelApp.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";
import DailyOrWeeklyPanel from "./components/DailyOrWeeklyPanel";

/**
 * Side Panel UI Layout for the Chrome Extension.
 */
function SidePanelApp() {
  const isAuthenticated = useAuth();

  return (
    <>
      <AccordionMenu />
    </>
  );
}

export default SidePanelApp;
