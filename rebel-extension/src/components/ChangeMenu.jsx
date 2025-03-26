import { useEffect, useState, useRef } from "react";

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'bootstrap/dist/css/bootstrap.min.css';
//import CalendarMenu from "./CalendarMenu"
import "../App.css";

/**
 * Change Menu Component - Creates a dropdown menu that allows the user to select the four (4) viewing options of the extension.
 * Uses React Bootstrap to display and format the menu.
 *
 * Features:
 * - Upon clicking the "Change" button it prompts open a dropdown menu displaying 4 options:
 * 	- Today's Reminders
 * 	- Important Reminders
 *	- Calendar View
 *		- Implemented via "CalendarMenu.jsx"
 *		- See CalendarMenu.jsx for documentation
 *	- Specific Date
 *
 * Authored by: Jeremy Besitula
 * 
 * Put into component App.jsx by Jeremy Besitula
 * @returns {JSX.Element} The Dropdown component UI.
 */
function ChangeMenu() {	
  const [isCalendarVisible, setCalendarVisibility] = useState(false);
  
  const handleClick = () => {
  	setCalendarVisibility(!isCalendarVisible);
  };

  return (
    <div>
      <Dropdown>
      	<DropdownButton id="dropdown-basic-button" title="Change">
      		<Dropdown.Item href="#/action-1">Today's Reminders</Dropdown.Item>
      		<Dropdown.Item href="#/action-2">Important Reminders</Dropdown.Item>
      		<Dropdown.Item href="#/action-3"
      		onClick = {handleClick}>
      			
      		Calendar View</Dropdown.Item>
      		
      		<Dropdown.Item href="#/action-4">Specific Date</Dropdown.Item>
      	</DropdownButton>
      </Dropdown>
      {isCalendarVisible ? <CalendarMenu /> : null }
    </div>
    
  );
}

export default ChangeMenu;
