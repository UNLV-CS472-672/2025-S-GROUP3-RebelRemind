import { useEffect, useState, useRef } from "react";
import "../App.css";
import "./css/CalendarView.css";

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
 * Assignment and User Created Event support by: Gunnar Dalton
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

	const [events, setEvents] = useState([]);

	/**
     * Effect Hook: Load the stored Canvas assignments and user created events when the component mounts.
     */
	useEffect(() => {
		/**
 		* Calls the correct functions to get Canvas assignments and user created events and places them together in one array.
 		*/
		const fetchEvents = async () => {
			const canvasAssignments = await getCanvasAssignments();
			const userEvents = await getUserEvents();
			setEvents([ ...canvasAssignments, ...userEvents]);
		};
		fetchEvents();

		/**
 		* Listens for messages indicating that a user created event has been created or updated.
 		*/
		const handleMessage = (message) => {
            if (message.type === "EVENT_CREATED" || message.type === "EVENT_UPDATED") {
                fetchEvents();
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
	}, []);

	return (
  	<div >
    	  <Calendar
      	  localizer={localizer}
      	  events={events}	
          defaultView= 'day'		
          views= {['day', 'week']}	
      	  startAccessor="start"
      	  endAccessor="end"
		  allDayAccessor="allDay"
      	  min= {minLimit}
      	  max= {maxLimit}
      	  defaultDate = {new Date()}
      	  style={{ height: 600 }}
    	  />
  	</div>
	);  
}

export default CalendarMenu;

/**
 * Gets the list of Canvas assignments from storage and formats it in the correct way to be handled by the calendar.
 */
const getCanvasAssignments = async () => {
	return new Promise ((resolve) => {
		chrome.storage.local.get("Canvas_Assignments", (data) => {
			if (data.Canvas_Assignments) { 
				const assignmentList = data.Canvas_Assignments;
				const canvasAssignments = assignmentList.map(assignment => ({
					title: assignment.title,
					start: new Date(assignment.due_at),
					end: new Date(assignment.due_at),
					description: assignment.context_name
				}));
				resolve(canvasAssignments);
			} else { 
				resolve([]); 
			}
		});
	})
};

/**
 * Gets the list of user created events from storage and formats it in the correct way to be handled by the calendar.
 */
const getUserEvents = async () => {
	return new Promise ((resolve) => {
		chrome.storage.local.get("userEvents", (data) => {
			if (data.userEvents) { 
				const userEvents = data.userEvents;
				const userCalendarEvents = userEvents.map(event => ({
					title: event.title,
					start: event.allDay ? new Date (`${event.date}T00:00:00`) : new Date(`${event.date}T${event.startTime}:00`),
					end: event.allDay ? new Date (`${event.date}T00:00:00`) : new Date(`${event.date}T${event.endTime}:00`),
					allDay: event.allDay,
					description: event.desc
				}))
				resolve(userCalendarEvents);
			} else { 
				resolve([]); 
			}
		});
	})
};