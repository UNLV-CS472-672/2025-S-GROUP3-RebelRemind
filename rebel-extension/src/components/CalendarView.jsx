import { useEffect, useState, useRef } from "react";
import "../App.css";
import "./css/CalendarView.css";
import calendarEvents from "./calendarEvents.js";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

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
 *       react-bootstrap to display events via the "Modal" component.
 *
 * Features:
 * - Selecting "Day" or "Week" displays a range of dates based on the current date (or locale).
 *   Renders Day-view or Week-view. Should display assignments and events from backend (TBD).
 *
 * Components:
 * - CalendarView.css for styling. (Modified to fit the extension's color scheme and size)
 * - react-boostrap / Modal for displaying events in a pop-up window. (Formatted manually but styled via CalendarView.css
 *
 * Authored by: Jeremy Besitula
 *
 * Put into component CalendarView.jsx by Jeremy Besitula
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
	const [select, setSelect] = useState();
	const [show, setShow] = useState(false);
	const [modalTitle, setmodalTitle] = useState('Modal Title');
	const [modalBody, setmodalBody] = useState('Modal Body');
	
	const handleClose = () => setShow(false);
  	const handleShow = () => setShow(true);
	
	const handleSelect = (event) => {
		setSelect(event);
		setShow(true);
		setmodalTitle(event.title);
		
		//IDEA:  USE A STATE OR THE EVENT TO DIRECT CONTROL FLOW TO 2 DIFFERENT TEMPLATES FOR FORMATTING
		//	 EVENT (1) 	--> TITLE, STARTS, ENDS, DESCRIPTION, LOCATION
		//				*NOTE: EVENT MAY HAVE A COMBINATION OF: DESCRIPTION AND LOCATION, ONE OR THE OTHER IS MISSING, BOTH ARE MISSING
		//	 ASSIGNMENT (0) --> TITLE, DUE, COURSE
		
		if(event.id === 1){
			const eventStart = "Started at:\t\t" + ((event.start).toString()).slice(0,15) + ", " + (event.start).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: 'true'
			}) + '\n';
			const eventEnd = "Ends at:\t\t" + ((event.end).toString()).slice(0,15) + ", " + (event.end).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: 'true'
			}) + '\n';
			const eventDate = ((event.start).getTime() === (event.end).getTime()) ? ("Date:\t\t\t" + ((event.start).toString()).slice(0,15) + ", " + (event.start).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: 'true'
			}) + '\n') : ( undefined ) ;
			const eventLocation = event.location === undefined ? "" : ("Location:\t\t" + (event.location).toString() + '\n');
			const eventDesc = event.description === undefined ? "" :  ("Description:\t" + (event.description).toString());
		
			if(eventDate === undefined){
				setmodalBody(eventStart + eventEnd + eventLocation + eventDesc);}
			else{
				setmodalBody(eventDate + eventLocation + eventDesc);}
			
		} else {
			const eventDue = "Due at:\t\t" + ((event.end).toString()).slice(0,15) + ", " + (event.end).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: 'true'
			}) + '\n';
			const eventCourse = "Course:\t\t" + (event.course).toString();
			setmodalBody(eventDue + eventCourse);
		}
	};

	useEffect(() => {
		const fetchEvents = async () => {
			const canvasAssignments = await getCanvasAssignments();
			const userEvents = await getUserEvents();
			setEvents([ ...canvasAssignments, ...userEvents]);
		};
		fetchEvents();

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
      	  events={calendarEvents}
      	  //events={events}	
          defaultView= 'day'		
          views= {['day', 'week']}	
      	  startAccessor="start"
      	  endAccessor="end"
		  allDayAccessor="allDay"
      	  min= {minLimit}
      	  max= {maxLimit}
      	  defaultDate = {new Date()}
      	  selected = {select}
      	  onSelectEvent = {handleSelect}
      	  style={{ height: 700 }}
    	  />
    	  <Modal show={show} onHide={handleClose}>
        	<Modal.Header closeButton closeVariant="black">
          		<Modal.Title>{modalTitle}</Modal.Title>
        	</Modal.Header>
        	<Modal.Body style={{ whiteSpace: 'pre' }} >{modalBody}</Modal.Body>
        	<Modal.Footer>
          	<Button variant="secondary" onClick={handleClose} style={{color:"#ffffff"}}>
            		Close
          	</Button>
        	</Modal.Footer>
      	  </Modal>
  	</div>
	);  
}

export default CalendarMenu;

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

const getUserEvents = async () => {
	console.log("Here");
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
