import { useEffect, useState, useRef } from "react";
import { fetchEvents } from "../../public/scripts/fetch-events.js";

import Accordion from 'react-bootstrap/Accordion';
import CanvasAssignments from "./CanvasAssignments";
import 'bootstrap/dist/css/bootstrap.min.css';
import Events from "./Events";
import Toggle from "./Toggle";
/**
 * Accordion Menu Component - Creates a drop-down style menu that displays the three (3) main submenus of the extension.
 * Uses React Bootstrap to display and format the menu.
 *
 * Features:
 * - Upon opening the extension, it displays a collapsed collection of submenus
 * 	- Upcoming Assignments
 * 	- Your Events
 *	- UNLV Events
 *
 * Authored by: Jeremy Besitula
 * 
 * Put into component AccordionMenu.jsx by Jeremy Besitula
 * @returns {JSX.Element} The AccordionMenu component UI.
 */
 function AccordionMenu() {
  const [ac_events, setACEvents] = useState([]);
  const [ic_events, setICEvents] = useState([]);
  const [rc_events, setRCEvents] = useState([]);
  const [uc_events, setUCEvents] = useState([]);
  const [viewMode, setViewMode] = useState("daily");

  const today = new Date().toLocaleDateString('en-CA');
  // save state 
  useEffect(() => {
    chrome.storage.sync.get("viewMode", (result) => {
      if (result.viewMode) {
        setViewMode(result.viewMode);
      }
    });
  }, []);
  
  useEffect(() => {
    chrome.storage.sync.set({ viewMode });
  }, [viewMode]);

  useEffect(() => {
    const getEvents = async () => {
      const [data1, data2, data3, data4] = await fetchEvents(today);
  
      if (data1 && !data1.hasOwnProperty("message")) {
        setACEvents(data1);
      }
      if (data2 && !data2.hasOwnProperty("message")) {
        setICEvents(data2);
      }
      if (data3 && !data3.hasOwnProperty("message")) {
        setRCEvents(data3);
      }
      if (data4 && !data4.hasOwnProperty("message")) {
        setUCEvents(data4);
      }
    };
    getEvents();
  }, []);
  
  return (
    <div className="accordion-scroll-wrapper">
        <div className="accordion-header" style={{ 
        paddingTop: "0.4rem",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "0.5rem", 
        paddingRight: "1rem",
      }}>
        <p className="accordion-text" style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          Your {viewMode === "daily" ? "Day" : "Week"} at a Glance!
        </p>
        <Toggle
          isChecked={viewMode === "weekly"}
          onChange={() => setViewMode(prev => (prev === "daily" ? "weekly" : "daily"))}
        />
      </div>
      <Accordion defaultActiveKey={["0", "1", "2"]} alwaysOpen>
      	<Accordion.Item eventKey="0">
      	<Accordion.Header>📚 Upcoming Assignments</Accordion.Header>

          <Accordion.Body className="accordion-panel-scroll">
          {/* • <strong> 🗺️ History 405:</strong> Homework 3 due by this Sunday <strong> <br />
          • <strong> 💻 CS 472:</strong> DP II</strong> due by next week Tuesday. */}
          <CanvasAssignments viewMode={viewMode}>

            </CanvasAssignments>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>📅 Your Events</Accordion.Header>
          <Accordion.Body className="accordion-panel-scroll">
            {/* Additional category filtering
             will go here for 
                  -involvement center */}
            <Events events={ic_events} viewMode={viewMode} />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>🎉 UNLV Events</Accordion.Header>
          <Accordion.Body className="accordion-panel-scroll">
            {/* Additional category filtering
             will go here for 
                  -UNLV cal
                  - academic cal 
                  -  rebel cov */}
            <Events events={[...uc_events, ...ac_events, ...rc_events]} viewMode={viewMode} />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default AccordionMenu;