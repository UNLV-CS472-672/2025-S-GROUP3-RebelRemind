import { useEffect, useState, useRef } from "react";

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
    const fetchEvents = async () => {
      try {
        const [res1, res2, res3, res4] = await Promise.all([
          fetch(`http://franklopez.tech:5050/academiccalendar_${viewMode}/${today}`),
          fetch(`http://franklopez.tech:5050/involvementcenter_${viewMode}/${today}`),
          fetch(`http://franklopez.tech:5050/rebelcoverage_${viewMode}/${today}`),
          fetch(`http://franklopez.tech:5050/unlvcalendar_${viewMode}/${today}`)
        ]);

        const [data1, data2, data3, data4] = await Promise.all([
          res1.json(), res2.json(), res3.json(), res4.json()
        ]);
        setACEvents(!data1.message ? data1 : []);
        setICEvents(!data2.message ? data2 : []);
        setRCEvents(!data3.message ? data3 : []);
        setUCEvents(!data4.message ? data4 : []);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, [viewMode]);

  return (
    <div>
      <div className="accordion-header" style={{ 
        paddingTop: "1rem",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1rem", 
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

      <Accordion alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>📚 Upcoming Assignments</Accordion.Header>
          <Accordion.Body>
            <CanvasAssignments />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>📅 Your Events</Accordion.Header>
          <Accordion.Body>
            <Events events={ic_events} viewMode={viewMode} />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>🎉 UNLV Events</Accordion.Header>
          <Accordion.Body>
            <Events events={[...uc_events, ...ac_events, ...rc_events]} viewMode={viewMode} />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default AccordionMenu;
