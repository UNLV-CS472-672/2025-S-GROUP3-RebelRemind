import { useEffect, useState, useRef } from "react";

import Accordion from 'react-bootstrap/Accordion';
import CanvasAssignments from "./CanvasAssignments";
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const now = new Date();
  const today = now.toLocaleDateString('en-CA')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [res1, res2, res3, res4] = await Promise.all([
          fetch(`http://franklopez.tech:5050/academiccalendar_daily/${today}`),
          fetch(`http://franklopez.tech:5050/involvementcenter_daily/${today}`),
          fetch(`http://franklopez.tech:5050/rebelcoverage_daily/${today}`),
          fetch(`http://franklopez.tech:5050/unlvcalendar_daily/${today}`),
        ]);

        const [data1, data2, data3, data4] = await Promise.all([
          res1.json(), res2.json(), res3.json(), res4.json()
        ]);

        if (!data1.hasOwnProperty("message")) {
          setACEvents(data1);
        } if (!data2.hasOwnProperty("message")) {
          setICEvents(data2);
        } if (!data3.hasOwnProperty("message")) {
          setRCEvents(data3);
        } if (!data4.hasOwnProperty("message")) {
          setUCEvents(data4);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);
  
  return (
    <div className="accordion-scroll-wrapper">
      <Accordion defaultActiveKey={["0", "1", "2"]} alwaysOpen>
      	<Accordion.Item eventKey="0">
      	<Accordion.Header>📚 Upcoming Assignments</Accordion.Header>
          <Accordion.Body className="accordion-panel-scroll">
          {/* • <strong> 🗺️ History 405:</strong> Homework 3 due by this Sunday <strong> <br />
          • <strong> 💻 CS 472:</strong> DP II</strong> due by next week Tuesday. */}
          <CanvasAssignments>
          </CanvasAssignments>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>📅 Your Events</Accordion.Header>
          <Accordion.Body className="accordion-panel-scroll">
            {ic_events.map(event => (
              <div key={event.id}>
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  • {event.name} - <strong>{event.time}</strong> located in <strong>{event.location}</strong>!
                </a>
              </div>
            ))}
            {uc_events.map(event => (
              <div key={event.id}>
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  • {event.name} - <strong>{event.time}</strong>!
                </a>
              </div>
            ))}
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>🎉 UNLV Events</Accordion.Header>
          <Accordion.Body>
            {ac_events.map(event => (
              <div key={event.id}>
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  • <strong>{event.name}</strong>
                </a>
              </div>
            ))}
            {rc_events.map(event => (
              <div key={event.id}>
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  • <strong>{event.name}</strong> {event.time}
                </a>
              </div>
            ))}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default AccordionMenu;
