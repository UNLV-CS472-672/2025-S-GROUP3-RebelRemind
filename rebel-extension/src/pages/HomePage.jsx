import "./css/HomePage.css";
import CloseButton from "../components/CloseButton";
import AccordionMenu from "../components/AccordionMenu";
import SidePanelButton from "../components/SidePanelButton";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react"; 

/**
 * Main UI Layout for the Chrome Extension.
 */
function HomePage() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const DropdownRef = useRef(null);
  
  const handleClickAway = (event) => {
    if (DropdownRef.current && !DropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  // Resize popup to original size when HomePage loads
  useEffect(() => {
    // Wait a tick to make sure layout is rendered
    setTimeout(() => {
      window.resizeTo(330, 400);
    }, 50);
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, []);

  return (
    <div >
      <img
        src="/images/rebel-remind.png"
        alt="Rebel Remind Logo"
        className="rebel-remind-logo"
      />
      <CloseButton />

      <AccordionMenu />

      {/*Change View Dropdown Floating */}
      <div style={{ display: 'flex', gap: '269px' }} >
		  <div className="change-view-container">
		    <button
		      className="change-view-btn"
		      onClick={() => setShowDropdown((prev) => !prev)}
		      style= {{position: 'sticky'}}
		    >
		      Change View
		    </button>

		    {showDropdown && (
		      <div className="change-view-dropdown" ref={DropdownRef} style= {{position: 'fixed'}}>
		        <button onClick={() => navigate("/user-events")}>
		          Personalize Events
		        </button>
		        <SidePanelButton />
		        <button onClick={() => navigate("/pomodoro")}>Pomodoro</button>
		      </div>
		    )}
		  </div>
		  
		   <div className="settings-button-container">
		    <button
		      className="settings-button"
		      onClick={() => navigate("/settings")}
		      style={{position: 'sticky'}}
		    >
		      ⚙️
		    </button>
		  </div>
      </div >
    </div>
  );
}

export default HomePage;

