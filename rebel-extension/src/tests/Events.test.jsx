import { render, screen } from '@testing-library/react';
import Events from '../components/Events';

describe('Events component', () => {
  const mockDailyEvents = [
    { id: 1, name: 'Event A', time: '10:00 AM', link: 'https://example.com', organization: 'Org A', date: '2025-04-21' },
    { id: 2, name: 'Event B', time: '2:00 PM', link: 'https://example.com', organization: 'Org B', date: '2025-04-21' },
  ];

  const mockWeeklyEvents = [
    {
      id: 1,
      name: 'Weekly Event Sunday',
      time: '1:00 PM',
      link: 'https://example.com',
      organization: 'Org A',
      date: '2025-04-20', // Sunday
    },
    {
      id: 2,
      name: 'Weekly Event Monday',
      time: '3:00 PM',
      link: 'https://example.com',
      organization: 'Org B',
      date: '2025-04-21', // Monday
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
});
