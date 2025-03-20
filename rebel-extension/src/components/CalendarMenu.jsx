import { useEffect, useState, useRef } from "react";

import Calendar from 'react-calendar';
import "./Calendar.css";
import "../App.css";

/**
 * Calendar Menu Component - Creates a calendar that takes in the current date 
 *	(from locale or machine) and displays it upon selection "Calendar View" 
 *	from the "Change" button menu.
 * Uses react-calendar to display and format the menu.
 *
 * Features:
 * - Selecting "Calendar View" places a Calendar object into the extension, and renders a month-by-month
 *   view based on the current date.
 * 	- Current month on top with current year
 * 	- Displays weekends left and right side (Gregorian calendar style)
 *	- Buttons to move the calendar back and forth by month
 *
 * Components:
 * - Calendar.css for styling.
 *
 * Authored by: Jeremy Besitula
 * 
 * Put into component ChangeMenu.jsx by Jeremy Besitula
 * @returns {JSX.Element} The react-calendar component UI.
 */

function CalendarMenu() {
  const [value, setValue] = useState(new Date());

  function onChange(nextValue) {
    setValue(nextValue);
  }

  return (
    <Calendar
      onChange={onChange}
      value={value}
      calendarType = "gregory"
    />
  );
}

export default CalendarMenu;
