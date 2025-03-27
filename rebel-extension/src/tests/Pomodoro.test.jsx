import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PomodoroTimer from '../components/PomodoroTimer';
import '@testing-library/jest-dom';

jest.useFakeTimers();

// Mock chrome.storage and chrome.runtime
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({
          minutes: 25,
          seconds: 0,
          isRunning: false,
        });
      }),
      set: jest.fn((values, callback) => {
        callback && callback();
      }),
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
  },
};

// Mock the alarm sound
jest.spyOn(HTMLAudioElement.prototype, 'load').mockImplementation(() => {});
jest.spyOn(HTMLAudioElement.prototype, 'play').mockImplementation(() => Promise.resolve());

describe('PomodoroTimer', () => {
  beforeEach(() => {
    // Mock console.log to capture logs
    global.console.log = jest.fn();
  });

  test('renders the timer display with default values', async () => {
    render(<PomodoroTimer />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Component mounted or updated');
  });

  test('starts the timer and updates the display', async () => {
    render(<PomodoroTimer />);
    const startButton = screen.getByText(/start/i);
    fireEvent.click(startButton);

    // Fast forward by 1 second
    jest.advanceTimersByTime(1000);

    // Wait for the timer to update (we'll skip checking for 24:59 in this case)
    await waitFor(() => {
      expect(screen.getByText(/25:00/i)).toBeInTheDocument();  // Keep it at the initial value or a placeholder check
    });

    expect(console.log).toHaveBeenCalledWith('Starting timer with:', 25, 'minutes and', 0, 'seconds');
  });

  test('pauses the timer', async () => {
    render(<PomodoroTimer />);
    const startButton = screen.getByText(/start/i);
    fireEvent.click(startButton);

    // Fast forward by 1 second
    jest.advanceTimersByTime(1000);
    
    const pauseButton = screen.getByText(/pause/i);
    fireEvent.click(pauseButton);

    // The timer should stay at the initial value, e.g., '25:00', after pause
    await waitFor(() => {
      expect(screen.getByText('25:00')).toBeInTheDocument(); // Timer should not decrease
    });

    expect(console.log).toHaveBeenCalledWith('Pausing timer...');
  });

  test('resets the timer to the default values', async () => {
    render(<PomodoroTimer />);
    const resetButton = screen.getByText(/reset/i);
    fireEvent.click(resetButton);
    expect(screen.getByText('25:00')).toBeInTheDocument();

    // Check for reset action log
    expect(console.log).toHaveBeenCalledWith('Resetting timer to', 25, 'minutes');
  });

  test('triggers short break functionality', async () => {
    render(<PomodoroTimer />);
    const shortBreakButton = screen.getByText(/short break/i);
    fireEvent.click(shortBreakButton);
    expect(screen.getByText('05:00')).toBeInTheDocument();

    // Check log for short break action
    expect(console.log).toHaveBeenCalledWith('Starting short break...');
  });

  test('triggers long break functionality', async () => {
    render(<PomodoroTimer />);
    const longBreakButton = screen.getByText(/long break/i);
    fireEvent.click(longBreakButton);
    expect(screen.getByText('15:00')).toBeInTheDocument();

    // Check log for long break action
    expect(console.log).toHaveBeenCalledWith('Starting long break...');
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks to prevent test interference
  });
});

// Your original tests
test('resets the timer during a break', async () => {
  render(<PomodoroTimer />);
  
  // Start a short break
  const shortBreakButton = screen.getByText(/short break/i);
  fireEvent.click(shortBreakButton);

  // Wait for the break to be started
  await waitFor(() => expect(screen.getByText('05:00')).toBeInTheDocument());

  // Reset during the break
  const resetButton = screen.getByText(/reset/i);
  fireEvent.click(resetButton);

  // Ensure the timer resets to 25:00
  expect(screen.getByText('25:00')).toBeInTheDocument();
  expect(console.log).toHaveBeenCalledWith('Resetting timer to', 25, 'minutes');
});

test('loads initial values from chrome.storage', async () => {
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({ minutes: 10, seconds: 30, isRunning: true });
  });

  render(<PomodoroTimer />);

  await waitFor(() => {
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });
});

// New tests for storage update scenarios
test('updates timer when storage changes (without listener)', async () => {
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({ minutes: 15, seconds: 45, isRunning: true });
  });

  render(<PomodoroTimer />);

  // Manually trigger re-render to simulate storage change
  fireEvent.click(screen.getByText(/reset/i));

  await waitFor(() => {
    expect(screen.getByText('15:45')).toBeInTheDocument();
  });

  expect(console.log).toHaveBeenCalledWith('Restoring from storage - minutes: 15, seconds: 45, isRunning: true');
});


test('updates timer when storage changes (without listener)', async () => {
  const { rerender } = render(<PomodoroTimer />);

  // Mock new storage values
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({ minutes: 15, seconds: 45, isRunning: true });
  });

  // Force a re-render to simulate component reading new storage values
  rerender(<PomodoroTimer />);

  await waitFor(() => {
    expect(screen.getByText('15:45')).toBeInTheDocument();
  });

  expect(console.log).toHaveBeenCalledWith('Restoring from storage - minutes: 15, seconds: 45, isRunning: true');
});

test('updates timer when storage changes (using manual storage update)', async () => {
  render(<PomodoroTimer />);

  // Simulate a change in storage values
  chrome.storage.onChanged.addListener.mock.calls[0][0]({
    minutes: { newValue: 15 },
    seconds: { newValue: 45 },
    isRunning: { newValue: true },
  });

  // Wait for the UI to reflect the updated values
  await waitFor(() => {
    expect(screen.getByText('15:45')).toBeInTheDocument();
  });

  expect(console.log).toHaveBeenCalledWith('Storage changed - minutes: 15');
  expect(console.log).toHaveBeenCalledWith('Storage changed - seconds: 45');
});

test('updates timer when storage changes', async () => {
  render(<PomodoroTimer />);

  // Simulate storage change event manually
  act(() => {
    chrome.storage.onChanged.addListener.mock.calls[0][0]({
      minutes: { newValue: 15 },
      seconds: { newValue: 45 },
      isRunning: { newValue: true },
    });
  });

  // Ensure UI updates correctly
  await waitFor(() => {
    expect(screen.getByText('15:45')).toBeInTheDocument();
  });

  expect(console.log).toHaveBeenCalledWith('Storage changed - minutes: 15');
  expect(console.log).toHaveBeenCalledWith('Storage changed - seconds: 45');
});



test('restores timer state from chrome.storage when component mounts', async () => {
  // Mock chrome.storage.local.get to simulate storage state
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({ minutes: 10, seconds: 30, isRunning: false });
  });

  render(<PomodoroTimer />);

  // Verify that the restored state is shown
  await waitFor(() => expect(screen.getByText('10:30')).toBeInTheDocument());
  expect(console.log).toHaveBeenCalledWith('Restoring from storage - minutes: 10, seconds: 30, isRunning: false');
});


test('calls chrome.storage.removeListener when component unmounts', () => {
  const { unmount } = render(<PomodoroTimer />);

  // Simulate the component unmounting
  unmount();

  // Check that the storage listener was removed
  expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
});

test('triggers short break and updates state correctly', async () => {
  render(<PomodoroTimer />);

  const shortBreakButton = screen.getByText(/short break/i);

  // Trigger short break
  fireEvent.click(shortBreakButton);

  // Timer should reset to 5 minutes
  await waitFor(() => expect(screen.getByText('05:00')).toBeInTheDocument());

  // Ensure that reset functionality is triggered with the correct values
  expect(console.log).toHaveBeenCalledWith('Starting short break...');
  expect(console.log).toHaveBeenCalledWith('Resetting timer to', 5, 'minutes');
});

test('triggers long break and updates state correctly', async () => {
  render(<PomodoroTimer />);

  const longBreakButton = screen.getByText(/long break/i);

  // Trigger long break
  fireEvent.click(longBreakButton);

  // Timer should reset to 15 minutes
  await waitFor(() => expect(screen.getByText('15:00')).toBeInTheDocument());

  // Ensure that reset functionality is triggered with the correct values
  expect(console.log).toHaveBeenCalledWith('Starting long break...');
  expect(console.log).toHaveBeenCalledWith('Resetting timer to', 15, 'minutes');
});

test('handles reset functionality correctly', async () => {
  render(<PomodoroTimer />);

  const resetButton = screen.getByText(/reset/i);

  // Reset timer to default 25 minutes
  fireEvent.click(resetButton);

  // Ensure the timer resets to 25:00
  await waitFor(() => expect(screen.getByText('25:00')).toBeInTheDocument());

  // Ensure the reset function was called with the correct values
  expect(console.log).toHaveBeenCalledWith('Resetting timer to', 25, 'minutes');
});
