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
 * Put into component DailyReminders.jsx by Jeremy Besitula
 * @returns {JSX.Element} The DailyReminders component UI.
 */
function DailyReminders() {
  return (
    <div>
      <Accordion alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Today's events</Accordion.Header>
          <Accordion.Body>Nothing planned for today</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default DailyReminders;
