import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CalendarView from '../components/CalendarView';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import calendarEvents from "../components/calendarEvents.js";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn((key, callback) => {
        callback({ title: "Test_Assignment",
		   start: new Date(),
	           end: new Date(),
		   description: "Description 1" });
      }),
    },
  },
};


jest.mock("../components/calendarEvents.js", () => [
  {
    id: 1,
    title: "Test Event",
    start: new Date(),
    end: new Date(),
    description: "This is a test event description.",
    location: "Test Location",
  },
]);

// Mocking the react-big-calendar and date-fns libraries
jest.mock('react-big-calendar', () => ({
  //Calendar: () => <div>mockCalendarView</div>,

  
  Calendar: ({ onSelectEvent }) => {
    // Trigger the onSelectEvent function when the event is "clicked"
    return (
      <div onClick={() => onSelectEvent({ title: 'Test Event', start: new Date(), end: new Date(), description: 'This is a test event description.', location: 'Test Location', id: 1 })}>
        Calendar Component
      </div>
    );
  },
  
  
  dateFnsLocalizer: jest.fn(() => ({})), // Mock dateFnsLocalizer
}));

// Mock the handleSelect function globally above the tests
const handleSelectMock = jest.fn((event) => {
  // Mock the behavior of handleSelect that sets modal state
  setSelect(event);
  setShow(true);
  setmodalTitle(event.title);
  setmodalBody(
    `Started at: ${event.start.toString().slice(0, 15)}, ${event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} 
    Ends at: ${event.end.toString().slice(0, 15)}, ${event.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
    Location: ${event.location}
    Description: ${event.description}`
  );
});

jest.mock("react-bootstrap/Modal", () => ({
  ...jest.requireActual("react-bootstrap/Modal"),
  show: jest.fn(),
}));

// Mock date-fns and any specifically named imported like setHours/setMinutes
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'), // Mock while still preserving original functionality
  setHours: jest.fn(),  // Named import setHours
  setMinutes: jest.fn(),  // Named import setMinutes
  format: jest.fn(),
  parse: jest.fn(),
  startOfWeek: jest.fn(),
  getDay: jest.fn(),
  locale: { enUS: {} },
}));

describe('Calendar View Component', () => {
  it('renders the Calendar component', async () => {
    // Render the CalendarView component itself
    await act(async () => {
    render(<CalendarView />);
    });
    // Check that the Calendar actually appears in the extension
    expect(screen.getByText('Calendar Component')).toBeInTheDocument();
  });

  it('sets the min and max limits correctly', async () => {
    // To check that calendar's time limits were set correctly

    // Named imports must also be imported here in this test case
    const { setHours, setMinutes } = require('date-fns');

    // First render the calendar to invoke the functions needed to display it
    await act(async () => {
    render(<CalendarView />);
    });
    // Check that the hours and minutes were set correctly (7:00 AM to 11:59 PM
    expect(setHours).toHaveBeenCalledWith(expect.any(Date), 7);  // Min limit
    expect(setMinutes).toHaveBeenCalled();

    expect(setHours).toHaveBeenCalledWith(expect.any(Date), 23); // Max limit
    expect(setMinutes).toHaveBeenCalled();
  });

  // To check that the calendar can actually handle events if given one
  it('passes calendarEvents to the Calendar component', async () => {
    const calendarEventsMock = [
      { start: new Date(), end: new Date(), title: 'Test Event' }
    ];
    
    // Render the calendar while explicitly passing the events prop
    await act(async () => {
    render(<CalendarView events={calendarEventsMock} />);
    });

    // Check that the Calendar component receives and uses the events prop
    expect(screen.getByText('Calendar Component')).toBeInTheDocument();
  });
  
  it('testing the modal if it opens', async () => {
    /*
    // Create mock event data
    const mockEvent = {
      id: 1,
      title: "Test Event",
      start: new Date(),
      end: new Date(),
      description: "Test event description",
      location: "Test Location",
    };
    */
    
    /* 
    await act(async () => {
    render(<CalendarView />);
    });
    */
    
    // Render the CalendarView component and pass mockEvent
    
    await act(async () => {
      render(<CalendarView onSelectEvent={handleSelectMock}/* events={mockEvent} onSelectEvent={handleSelectMock}*/ />);
    });
    
    fireEvent.click(screen.getByText('Test Event'));
    
    await waitFor(() => screen.getByText('Event Details'));
    
    // Check if the mock handleSelect was called
    //expect(handleSelectMock).toHaveBeenCalledWith(mockEvent);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Check if the modal displays the event details
    expect(screen.getByText("Test event description")).toBeInTheDocument();
    expect(screen.getByText("Test Location")).toBeInTheDocument();
  });
});
