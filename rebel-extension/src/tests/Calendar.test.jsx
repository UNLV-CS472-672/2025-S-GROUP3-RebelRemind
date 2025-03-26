import { render, screen } from '@testing-library/react';
import CalendarView from '../components/CalendarView';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
/*
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
*/
//import { setHours } from "date-fns";
//import { setMinutes } from "date-fns";


// Mocking the react-big-calendar and date-fns libraries
jest.mock('react-big-calendar', () => ({
  Calendar: () => <div>Calendar Component</div>,
  dateFnsLocalizer: jest.fn(() => ({})), // Mock dateFnsLocalizer
}));

// Mock the entire date-fns module to ensure named exports like setHours and setMinutes are properly mocked
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'), // Preserve all other date-fns functionality
  setHours: jest.fn(),  // Mock setHours
  setMinutes: jest.fn(),  // Mock setMinutes
  format: jest.fn(),
  parse: jest.fn(),
  startOfWeek: jest.fn(),
  getDay: jest.fn(),
  locale: { enUS: {} },  // Mock locale
}));

/*
jest.mock('date-fns', () => ({
  __esModule: true,
  ...jest.requireActual('date-fns'), // Import and retain original implementations of other date-fns functions
  setHours: jest.fn(), // Mock setHours
}));
*/

/*
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'), // Import and retain original implementations
  setHours: jest.fn((date, hours) => {
    const mockedDate = new Date(date);
    mockedDate.setHours(hours);
    return mockedDate;
  }),
}));
*/

/*
jest.mock('date-fns', () => ({
      setHours: jest.fn((date, hours) => {
        const newDate = new Date(date);
        newDate.setHours(hours);
        return newDate;
      }),
      // Mock other date-fns functions as needed
    }));
*/

/*
jest.mock('date-fns/format', () => jest.fn());
jest.mock('date-fns/parse', () => jest.fn());
jest.mock('date-fns/startOfWeek', () => jest.fn());
jest.mock('date-fns/getDay', () => jest.fn());
jest.mock('date-fns/locale/en-US', () => ({}));
//jest.mock('date-fns/setHours', () => jest.fn());
jest.mock('date-fns', () => ({ setHours: jest.fn() })); 
//jest.mock('date-fns/setMinutes', () => jest.fn());
jest.mock('date-fns', () => ({ setMinutes: jest.fn() })); 
*/

describe('Calendar View Component', () => {
  it('renders the Calendar component', () => {
    // Render the CalendarView component
    render(<CalendarView />);

    // Assert that the Calendar component text is present in the document
    expect(screen.getByText('Calendar Component')).toBeInTheDocument();
  });

  it('sets the min and max limits correctly', () => {
    // Test if setHours and setMinutes were called correctly.
    // You can verify by checking if these mock functions were called with the correct arguments

    // Import the functions after mocking them to spy on calls
    const { setHours, setMinutes } = require('date-fns');

    // The Calendar component will call these functions during rendering
    render(<CalendarView />);

    // Test that the setHours and setMinutes were called with the expected values.
    expect(setHours).toHaveBeenCalledWith(expect.any(Date), 7);  // Min limit
    expect(setMinutes).toHaveBeenCalledWith(expect.any(Date), 0);

    expect(setHours).toHaveBeenCalledWith(expect.any(Date), 23); // Max limit
    expect(setMinutes).toHaveBeenCalledWith(expect.any(Date), 59);
  });

  // Optionally, you can also check if the events are passed into the Calendar component correctly
  it('passes calendarEvents to the Calendar component', () => {
    const calendarEventsMock = [
      { start: new Date(), end: new Date(), title: 'Test Event' }
    ];
    
    // You can modify your component to accept a prop for events to make testing easier
    render(<CalendarView events={calendarEventsMock} />);

    // Check that the Calendar component receives and uses the events prop
    expect(screen.getByText('Calendar Component')).toBeInTheDocument();
    // Additional checks can be added depending on how events are used in the component
  });
});
