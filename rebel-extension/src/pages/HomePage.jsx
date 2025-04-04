import "./css/HomePage.css";
import CloseButton from "../components/CloseButton";
import AccordionMenu from "../components/AccordionMenu";
import GetAssignmentsButton from "../components/GetAssignmentsButton";
import SidePanelButton from "../components/SidePanelButton";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; 

/**
 * Main UI Layout for the Chrome Extension.
 */
function HomePage() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // Resize popup to original size when HomePage loads
  useEffect(() => {
    // Wait a tick to make sure layout is rendered
    setTimeout(() => {
      window.resizeTo(330, 400);
    }, 50);
  }, []);

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

      {/*Change View Dropdown Floating */}
      <div className="change-view-container">
        <button
          className="change-view-btn"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          Change View
        </button>

        {showDropdown && (
          <div className="change-view-dropdown">
            <button onClick={() => navigate("/user-events")}>
              Personalize Events
            </button>
            <SidePanelButton />
            <button onClick={() => navigate("/pomodoro")}>Pomodoro</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
