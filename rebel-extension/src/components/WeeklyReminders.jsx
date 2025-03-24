import { useEffect, useState, useRef } from "react";

import WeeklyCalendar from "./WeeklyCalendar.jsx";

/**
 * Reminders Calendar Component - Main container file that can be used to display the Weekly Calendar.
 *				  Can then be used to include other components on top or below the Calendar.
 * Uses React Bootstrap and react-big-calendar to display and format the menu.
 *
 * Features:
 * - DailyCalendar.jsx
 *	- Displays Calendar UI
 *
 * Original Documentation provided by: Billy Estrada
 *
 * New Documentation provided by: Jeremy Besitula (Accordion Menu)
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
  <div>
     <WeeklyCalendar />
  </div>
  );
}
export default WeeklyReminders;


