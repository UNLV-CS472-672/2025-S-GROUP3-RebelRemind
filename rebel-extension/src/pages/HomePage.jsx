import "./css/HomePage.css";
import CloseButton from "../components/CloseButton";
import AccordionMenu from "../components/AccordionMenu";
import GetAssignmentsButton from "../components/GetAssignmentsButton";
import SidePanelButton from "../components/SidePanelButton";

import { useNavigate } from "react-router-dom";

/**
 * Main UI Layout for the Chrome Extension.
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <img
        src="/images/rebel-remind.png"
        alt="Rebel Remind Logo"
        className="rebel-remind-logo"
      />
      <CloseButton />

      <div className="settings-button-container">
        <button
          className="settings-button"
          onClick={() => navigate("/settings")}
        >
          ⚙️
        </button>
      </div>

      <AccordionMenu />
      <GetAssignmentsButton />
      <br />
      <button onClick={() => navigate("/user-events")}>
        Personalize Events
      </button>
      <br />
      <br />
      <SidePanelButton />
      <button onClick={() => navigate("/pomodoro")}> Pomodoro </button>
    </div>
  );
}

export default HomePage;
