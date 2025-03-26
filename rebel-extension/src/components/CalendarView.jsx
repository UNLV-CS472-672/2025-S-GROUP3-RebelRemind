import { useEffect, useState, useRef } from "react";
import "../App.css";
import "./css/CalendarView.css";
import calendarEvents from "./calendarEvents";

//date-fns localizer for big-calendar
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import { setHours } from "date-fns";
import { setMinutes } from "date-fns";

/**
 * Calendar Menu Component - Creates a calendar that takes in the current date
 *			     (from locale or machine) and displays a calendar based on the day.
 * Uses: react-big-calendar to display and format the calendar
 *	 date-fns for reading and parsing the date from the locale.
 *
 * Features:
 * - Selecting "Daily Reminders" places a Calendar object into the extension,
 *   and renders a Day-Only view of the calendar. Should display assignments and events from backend (TBD).
 *
 * Components:
 * - react-big-calendar.css for styling. (Modified to fit the extension's color scheme and size)
 *
 * Authored by: Jeremy Besitula
 *
 * Put into component DailyCalendar.jsx by Jeremy Besitula
 * @returns {JSX.Element} The react-big-calendar component UI.
 */
 
function CalendarMenu() {
  	const locales = {
  	'en-US': enUS,
	}

	const localizer = dateFnsLocalizer({
  	format,
  	parse,
  	startOfWeek,
  	getDay,
  	locales,
	})

	const minLimit = setMinutes(setHours(new Date(), 7), 0);
	const maxLimit = setMinutes(setHours(new Date(), 23), 59);

	return (
  	<div >
    	  <Calendar
      	  localizer={localizer}
      	  events={calendarEvents}	
          defaultView= 'day'		
          views= {['day', 'week']}	
      	  startAccessor="start"
      	  endAccessor="end"
      	  min= {minLimit}
      	  max= {maxLimit}
      	  defaultDate = {new Date()}
      	  style={{ height: 600 }}
    	  />
  	</div>
	);  
}

export default CalendarMenu;
