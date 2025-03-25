import { useEffect, useState, useRef } from "react";
import "../App.css";
import "react-big-calendar/lib/css/react-big-calendar.css"

//date-fns localizer for big-calendar
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'

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

	return (
  	<div>
    	  <Calendar
      	  localizer={localizer}
      	  //events={myEventsList}	TO DO: MyEventsList MIGHT be the assignments list from Gunnar's API (TBD)
          defaultView= 'week'
          views= {['week', 'day']}
      	  startAccessor="start"
      	  endAccessor="end"
      	  style={{ height: 500 }}
    	  />
  	</div>
	);  
}

export default CalendarMenu;
