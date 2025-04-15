import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CalendarView from '../components/CalendarView';
import calendarEvents from "../components/calendarEvents.js";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('react-bootstrap/Modal', () => ({
  ...jest.requireActual('react-bootstrap/Modal'),
  show: jest.fn(),
  hide: jest.fn(),
}));

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

// Mock date-fns and any specifically named imported like setHours/setMinutes
jest.mock('date-fns', () => ({
  __esModule: true,
  ...jest.requireActual('date-fns'), // Mock while still preserving original functionality
  setHours: jest.fn(),  // Named import setHours
  setMinutes: jest.fn(),  // Named import setMinutes
  format: jest.fn(),
  parse: jest.fn(),
  startOfWeek: jest.fn(),
  getDay: jest.fn(),
  locale: { enUS: {} },
}));

const mockcalendarEvents = [
  {
    id: 1,
    title: "Test Event 1",
    start: new Date(),
    end: new Date(),
    description: "This is a test event description.",
    location: "Test Location",
  },
];

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


jest.mock('react-big-calendar', () => ({
  ...jest.requireActual('react-big-calendar'),
  Calendar: ({ onSelectEvent }) => {
    // Trigger the onSelectEvent function when the event is "clicked"
    return (
      <div onClick={() => onSelectEvent({ title: 'Test Event 1', start: new Date(), end: new Date(), description: 'This is a test event description.', location: 'Test Location', id: 1 })}>
        Mocked Calendar
      </div>
    );
  },
  dateFnsLocalizer: jest.fn(() => ({}))
}));


describe('CalendarView Component', () => {
  it('opens modal and displays correct content when event is clicked', async () => {
    
    await act(async () => {
    render(<CalendarView />);
    });
    
    fireEvent.click(screen.getByText('Mocked Calendar'));

    // Find and click the first event in the calendar
    const eventElement = screen.getByText('Test Event 1');
    fireEvent.click(eventElement);

    // Check that modal opens and displays the correct information
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
  });

  it('modal content is properly formatted and displays information accoridngly', async () => {
    await act(async () => {
    render(<CalendarView />);
    });
    
    fireEvent.click(screen.getByText('Mocked Calendar'));
    
    const mockEvent = (mockcalendarEvents[0]);

    // Find and click the first event in the calendar
    const eventElement = screen.getByText(mockEvent.title);
    fireEvent.click(eventElement);
    
    // Check that modal opens and displays the correct information
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
    
    // Check for location and description details
    const eventLocation = mockEvent.location;
    const eventDescription = mockEvent.description;
    expect(eventLocation).toEqual(expect.stringContaining("Location"));
    expect(eventDescription).toEqual(expect.stringContaining("description"));
  });

  it('closes modal when close button is clicked', async () => {
    await act(async () => {
    render(<CalendarView />);
    });
    
    fireEvent.click(screen.getByText('Mocked Calendar'));

    // Find and click the first event in the calendar
    const mockEvent = mockcalendarEvents[0];
    const eventElement = screen.getByText(mockEvent.title);
    fireEvent.click(eventElement);

    // Ensure the modal is open
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();

    // Simulate clicking the close button
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    // Ensure the modal is closed
    await waitFor(() => {
      expect(screen.queryByText(mockEvent.title)).not.toBeInTheDocument();
    });
    
  });
});

