import { useEffect, useState, useRef } from "react";
import { fetchEvents, subscribeToUserEvents, normalizeUserEvents } from "../../public/scripts/fetch-events.js";
import { filterEvents } from "../../public/scripts/filter-events";
import UserEventPopup from "./UserEventPopup";

import Accordion from 'react-bootstrap/Accordion';
import CanvasAssignments from "./CanvasAssignments";
import 'bootstrap/dist/css/bootstrap.min.css';
import Events from "./Events";
import Toggle from "./Toggle";

import canvasIcon from "../assets/canvas.png";
import unlvIcon from "../assets/UNLVIcon.png";
import calIcon from "../assets/calIcon.png";
/**
 * AccordionMenu.jsx
 *
 * This component renders the main collapsible menu for the Rebel Remind popup UI.
 * It uses React Bootstrap's Accordion to show three dynamic sections:
 *  - 📚 Upcoming Assignments (Canvas assignments)
 *  - 📅 Your Events (Involvement Center + custom user events)
 *  - 🎉 UNLV Events (Union, Academic, and Rec Center events)
 *
 * Features:
 * ✅ Dynamically loads and filters events from remote APIs and Chrome storage
 * ✅ Persists open/closed accordion state via chrome.storage.sync
 * ✅ Syncs view mode ("daily" or "weekly") across popup reloads
 * ✅ Supports user-created events with live updates and modal details
 * ✅ Automatically resizes open panels to evenly split height
 * ✅ Stores filtered events for notification use
 *
 * Subcomponents:
 * - CanvasAssignments.jsx – Loads Canvas tasks from API
 * - Events.jsx – Renders a list of passed events
 * - Toggle.jsx – Switches between daily/weekly modes
 * - UserEventPopup.jsx – Displays event details in a modal when clicked
 *
 * Originally Authored by: Jeremy Besitula
 * 
 * Edited by the rest of team in subsequent PR's
 * 
 * @returns {JSX.Element} The AccordionMenu component UI.
 */
function AccordionMenu() {
  const [filteredAC, setFilteredAcEvents] = useState([]);
  const [filteredIC, setFilteredIcEvents] = useState([]);
  const [filteredRC, setFilteredRcEvents] = useState([]);
  const [filteredUC, setFilteredUcEvents] = useState([]);

  const [user_events, setUserEvents] = useState([]);
  const [normalizedUserEvents, setNormUserEvents] = useState([]);
  const [activeEventPopup, setActiveEventPopup] = useState(null);
  const popupRef = useRef(null);

  const [viewMode, setViewMode] = useState("daily");
  useEffect(() => {
    chrome.storage.sync.get("viewMode", (result) => {
      if (result.viewMode) {
        setViewMode(result.viewMode); // save state of viewMode
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({ viewMode });
  }, [viewMode]);

/***  LOAD EVENTS and FILTER ***/

  const today = new Date().toLocaleDateString('en-CA');
  useEffect(() => {
    const loadEvents = async () => {
      const [newFilteredAC, newFilteredIC, newFilteredRC, newFilteredUC] = await filterEvents(today, viewMode);
      
      setFilteredAcEvents(newFilteredAC);
      setFilteredIcEvents(newFilteredIC);
      setFilteredRcEvents(newFilteredRC);
      setFilteredUcEvents(newFilteredUC);

      chrome.storage.local.set({
        filteredAC: newFilteredAC,
        filteredIC: newFilteredIC,
        filteredRC: newFilteredRC,
        filteredUC: newFilteredUC,
      });
    };
      

    loadEvents();
  }, [viewMode, today]);

/***  END LOAD and FILTER EVENTS  ***/


/***  USER EVENTS  ***/

    useEffect(() => {
      const unsubscribe = subscribeToUserEvents(setUserEvents);
      return unsubscribe;
    }, []);

    useEffect(() => {
      setNormUserEvents(normalizeUserEvents(user_events));
    }, [user_events]);

    // if user event is clicked
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (popupRef.current && !popupRef.current.contains(e.target)) {
          setActiveEventPopup(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

/***  END USER EVENTS  ***/

/***  DYNAMIC MENU SIZING  ***/

    const [openKeys, setOpenKeys] = useState([]);
    const [isAccordionReady, setIsAccordionReady] = useState(false);

    useEffect(() => {
      chrome.storage.sync.get("openKeys", (result) => {
        if (result.openKeys) {
          setOpenKeys(result.openKeys);
        } else {
          setOpenKeys(["0", "1", "2"]); // first-time default
        }
        setIsAccordionReady(true); // signal ready
      });
    }, []);

    const toggleKey = (key) => {
      const newKeys = openKeys.includes(key)
        ? openKeys.filter(k => k !== key)
        : [...openKeys, key];

      setOpenKeys(newKeys);
      chrome.storage.sync.set({ openKeys: newKeys });
    };

    const isOpen = (key) => openKeys.includes(key);

    // Dynamically determine height per open item
    const totalHeight = 465; // not the full 470 height so that the rounded bottom can be seen
    const headerHeight = 52;
    const openCount = openKeys.length;
    const bodyHeight = openCount > 0 ? (totalHeight - (3 * headerHeight)) / openCount : 0;

/***  END DYNAMIC MENU SIZING  ***/

  return (
    <div>
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
      <div className="accordion-wrapper">
        {isAccordionReady && (
          <Accordion activeKey={openKeys} alwaysOpen className="accordion">
            {["0", "1", "2"].map((key, index) => {
              const isSectionOpen = isOpen(key);
              const itemFlexGrow = isSectionOpen ? 1 : 0;

              return (
                <Accordion.Item
                  eventKey={key}
                  key={key}
                  className="accordion-item"
                  style={{ flexGrow: itemFlexGrow }}
                >
                <Accordion.Header onClick={() => toggleKey(key)}>
                  {index === 0 && (
                    <>
                      <img 
                        src= {canvasIcon}
                        alt= "canvasIcon" 
                        style={{ height: '20px', marginRight: '8px' }} 
                      />
                      Upcoming Assignments
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <img 
                        src={calIcon}
                        alt="calIcon" 
                        style={{  height: '20px', marginRight: '8px'}} 
                      />
                      Your Events
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <img 
                        src={unlvIcon}
                        alt="unlvIcon" 
                        style={{ marginLeft: '-6px', height: '20px' }} 
                      />    
                      UNLV Events
                    </>
                  )}
                </Accordion.Header>
                  <Accordion.Body
                    className="accordion-body"
                    style={{
                      display: isSectionOpen ? "block" : "none",
                      height: `${bodyHeight}px`, // height not maxHeight to ensure equal distribution
                    }}
                  >

                    {index === 0 && <CanvasAssignments viewMode={viewMode} />}
                    {index === 1 && <Events events={[...filteredIC, ...normalizedUserEvents]} viewMode={viewMode} setActiveEventPopup={setActiveEventPopup} />}
                    {index === 2 && <Events events={[
                      ...(Array.isArray(filteredUC) ? filteredUC : []),
                      ...(Array.isArray(filteredAC) ? filteredAC : []),
                      ...(Array.isArray(filteredRC) ? filteredRC : [])
                    ]} viewMode={viewMode} />}

                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        )}

        {/* 💬 Popup for Custom Event */}
        {activeEventPopup && (
          <UserEventPopup
          event={activeEventPopup}
          onClose={() => setActiveEventPopup(null)}
          popupRef={popupRef}
          />
        )}
      </div>

    </div>
  );
}

export default AccordionMenu;