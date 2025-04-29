import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Events from '../components/Events';

beforeAll(() => {
  global.chrome = {
      storage: {
        local: {
          get: jest.fn((key, callback) => {
            // Simulate data being fetched
            callback({ UNLVEvents: [] });  // Return an empty array as default
          }),
          set: jest.fn((data, callback) => {
            // Simulate saving to local storage and call the callback
            callback();  // Simulate successful save
          }),
        },
      },
      runtime: {
        sendMessage: jest.fn(),
      },
    };
  global.alert = jest.fn();
});



describe('Events component', () => {
  const mockDailyEvents = [
    { id: 1, name: 'Event A', startTime: '10:00 AM', link: 'https://example.com', organization: 'Org A', startDate: '2025-04-21' },
    { id: 2, name: 'Event B', startTime: '2:00 PM', link: 'https://example.com', organization: 'Org B', startDate: '2025-04-21' },
  ];

  const mockWeeklyEvents = [
    {
      id: 1,
      name: 'Weekly Event Sunday',
      startTime: '1:00 PM',
      link: 'https://example.com',
      organization: 'Org A',
      startDate: '2025-04-20', // Sunday
    },
    {
      id: 2,
      name: 'Weekly Event Monday',
      startTime: '3:00 PM',
      link: 'https://example.com',
      organization: 'Org B',
      startDate: '2025-04-21', // Monday
    },
  ];

  it('displays a message when no events are provided', () => {
    render(<Events events={[]} viewMode="daily" />);
    expect(screen.getByText(/no events found/i)).toBeInTheDocument();
  });

  it('renders a list of daily events correctly', () => {
    render(<Events events={mockDailyEvents} viewMode="daily" />);
    expect(screen.getByText(/Event A/i)).toBeInTheDocument();
    expect(screen.getByText(/Event B/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('groups and renders events by weekday when in weekly view', () => {
    render(<Events events={mockWeeklyEvents} viewMode="weekly" />);
    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText(/Weekly Event Sunday/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Event Monday/i)).toBeInTheDocument();
  });
  
  it('ensures the functionality of the add event button', async () => {
    render(<Events events={mockDailyEvents} viewMode="daily" />);
    expect(screen.getByText(/Event A/i)).toBeInTheDocument();
    expect(screen.getByText(/Event B/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    
    /*
    const button = screen.getByRole('button',(/add to calendar/i));
    
	fireEvent.click(button);
	expect(window.alert).toHaveBeenCalledWith('Event saved to calendar.');
	*/
	
	const eventStart = screen.getByText(/10:00 AM/i);
	const closestButton = eventStart.closest('span').querySelector('button[aria-label="add to calendar"]');
	expect(closestButton).toBeInTheDocument();
	fireEvent.click(closestButton);
	//expect(global.alert).toHaveBeenCalledWith('Event saved to calendar.');
	await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Event saved to calendar.'));
    
  });
});
