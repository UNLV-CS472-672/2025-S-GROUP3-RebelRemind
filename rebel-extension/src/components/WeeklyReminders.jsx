import { useEffect, useState, useRef } from "react";

import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Reminders Accordion Menu Component - Creates a drop-down style menu that displays the three (3) main submenus of the extension.
 * Uses React Bootstrap to display and format the menu.
 *
 * Features:
 * - Used to mock weekly reminders?
 * 	- Upcoming Assignments
 * 	- Your Events
 *	- UNLV Events
 *
 * Authored by: Billy Estrada
 *
 * Copied from: Jeremy Besitula (Accordian Menu)
 *
 * Put into component WeeklyReminders.jsx by Jeremy Besitula
 * @returns {JSX.Element} The WeeklyReminders component UI.
 */

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function WeeklyReminders() {
  const [groupedAssignments, setGroupedAssignments] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  return (
    <Accordion alwaysOpen>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Monday</Accordion.Header>
        <Accordion.Body>Nothing planned for today</Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>etc</Accordion.Header>
        <Accordion.Body>Nothing planned for today</Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default WeeklyReminders;
