import { useEffect, useState, useRef } from "react";

import DailyCalendar from "./DailyCalendar.jsx";

/**
 * Reminders Calendar Component - Main container file that can be used to display the Daily Calendar.
 *				  Can then be used to include other components on top or below the Calendar.
 * Uses React Bootstrap and react-big-calendar to display and format the menu.
 *
 * Features:
 * - DailyCalendar.jsx
 *	- Displays Calendar UI
 *
 * Original Documentation provided by: Billy Estrada
 * Authored by: Billy Estrada
 * Copied from: Jeremy Besitula (Accordion Menu)
 *
 * New Documentation provided by: Jeremy Besitula (Accordion Menu)
 * 
 * Put into component DailyReminders.jsx by Jeremy Besitula
 * @returns {JSX.Element} The DailyReminders component UI.
 */
function DailyReminders() {
  return (
      <DailyCalendar/>  
  );
}

export default DailyReminders;
