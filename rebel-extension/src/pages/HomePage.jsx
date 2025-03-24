import "./css/HomePage.css";


import CloseButton from "../components/CloseButton";
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
      <CloseButton />
      <button onClick={() => navigate("/settings")}> ⚙️ </button>
      <DailyOrWeeklyPanel />
      <SidePanelButton />
    </>
  );
}

export default HomePage;
