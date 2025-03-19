import { useEffect, useState, useRef } from "react";

import Accordion from 'react-bootstrap/Accordion';
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
  return (
    <div>
      <Accordion alwaysOpen>
      	<Accordion.Item eventKey="0">
      	<Accordion.Header>Upcoming Assignments</Accordion.Header>
          <Accordion.Body>
          • CS405 - Assignment 2 <br />
          • CS422 - Assignment 3 <br />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Your Events</Accordion.Header>
          <Accordion.Body>
          • Kat Parsons (CS251X Office Hours) <br />
          	&emsp;&emsp;&emsp; March 15th, 2025 - 1:00 PM
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>UNLV Events</Accordion.Header>
          <Accordion.Body>
          • UNLV Volleyball Tryouts: <br />
          	&emsp;&emsp;&emsp; March 31st, 2025 - 4:00 PM
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
    
  );
}

export default AccordionMenu;
