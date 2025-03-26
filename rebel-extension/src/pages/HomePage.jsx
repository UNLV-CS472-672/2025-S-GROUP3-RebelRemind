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
    <div >
      <CloseButton />
      <button
        style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: 'auto' }}
        onClick={() => navigate("/settings")}> ⚙️ </button>
      <AccordionMenu />    
      <GetAssignmentsButton />
      <br />
      <button onClick={() => navigate("/user-events")}> Personalize Events </button>
      <br />
      <br />
      <SidePanelButton />
    </div>
  );
}

export default HomePage;
