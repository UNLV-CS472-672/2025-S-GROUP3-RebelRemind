import "./css/HomePage.css";

import ChangeMenu from "../components/ChangeMenu";
import CalendarMenu from "../components/CalendarMenu";
import DailyOrWeeklyPanel from "../components/DailyOrWeeklyPanel";
import SidePanelButton from "../components/SidePanelButton";

import { useNavigate } from "react-router-dom";

/**
 * Main UI Layout for the Chrome Extension.
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate("/settings")}> ⚙️ </button>
      <DailyOrWeeklyPanel />
      <SidePanelButton />
    </>
  );
}

export default HomePage;
