import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PomodoroTimer from '../components/PomodoroTimer';
import '@testing-library/jest-dom';

jest.useFakeTimers();

// Mock chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({ minutes: 25, seconds: 0, isRunning: false });
      }),
      set: jest.fn((values, callback) => callback && callback()),
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


function ResetTestWrapper() {
  const [instance, setInstance] = React.useState(null);

  return (
    <>
      <PomodoroTimer ref={(ref) => setInstance(ref)} />
      <button onClick={() => instance?.handleReset?.(10)}>Custom Reset</button>
    </>
  );
}


// Mock alarm
jest.spyOn(HTMLAudioElement.prototype, 'load').mockImplementation(() => {});
jest.spyOn(HTMLAudioElement.prototype, 'play').mockImplementation(() => Promise.resolve());

describe('PomodoroTimer', () => {
  beforeEach(() => {
    global.console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default 25:00', async () => {
    render(<PomodoroTimer />);
    expect(await screen.findByText('25:00')).toBeInTheDocument();
  });

  test('starts and logs timer start', async () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByText(/start/i));
    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(console.log).toHaveBeenCalledWith('Starting timer with:', 25, 'minutes and', 0, 'seconds'));
  });

  test('pauses the timer and logs it', async () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByText(/start/i));
    fireEvent.click(screen.getByText(/pause/i));
    expect(console.log).toHaveBeenCalledWith('Pausing timer...');
  });

  test('resets to 25 minutes and logs it', async () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByText(/reset/i));
    expect(await screen.findByText('25:00')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Resetting timer to', 25, 'minutes');
  });

  test('short break resets to 5 minutes', async () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByText(/short break/i));
    expect(await screen.findByText('05:00')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Starting short break...');
  });

  test('long break resets to 15 minutes', async () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByText(/long break/i));
    expect(await screen.findByText('15:00')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Starting long break...');
  });

  test('auto-resets if loaded with 0:00 and not running', async () => {
    chrome.storage.local.get.mockImplementationOnce((_, cb) => cb({ minutes: 0, seconds: 0, isRunning: false }));
    render(<PomodoroTimer />);
    expect(await screen.findByText('25:00')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Auto-resetting timer to 25:00 after completion');
  });

  test('handles storage.get else block (partial values)', async () => {
    chrome.storage.local.get.mockImplementationOnce((_, cb) => cb({ minutes: 13, seconds: 14 }));
    render(<PomodoroTimer />);
    expect(await screen.findByText('13:14')).toBeInTheDocument();
  });

  test('covers else block when timer is not done', async () => {
    chrome.storage.local.get.mockImplementationOnce((_, cb) => cb({ minutes: 25, seconds: 1, isRunning: true }));
    render(<PomodoroTimer />);
    expect(await screen.findByText('25:01')).toBeInTheDocument();
  });

  test('triggers alarm and logs when reaching 0:00', async () => {
    chrome.storage.local.get.mockImplementationOnce((_, cb) => cb({ minutes: 0, seconds: 0, isRunning: true }));
    render(<PomodoroTimer />);
    await waitFor(() => expect(console.log).toHaveBeenCalledWith('Timer reached 0:00, triggering alarm...'));
  });

  test('handles alarm playback failure', async () => {
    const mockError = new Error('Playback failed');
    HTMLAudioElement.prototype.play.mockImplementationOnce(() => Promise.reject(mockError));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    chrome.storage.local.get.mockImplementationOnce((_, cb) => cb({ minutes: 0, seconds: 0, isRunning: true }));

    await act(async () => render(<PomodoroTimer />));
    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Audio playback failed:', mockError));
    errorSpy.mockRestore();
  });

  test('removes chrome.storage listener on unmount', () => {
    const { unmount } = render(<PomodoroTimer />);
    unmount();
    expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
  });

  test('updates minutes/seconds via input fields', async () => {
    render(<PomodoroTimer />);
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '12' } });
    fireEvent.change(inputs[1], { target: { value: '45' } });
    expect(inputs[0].value).toBe('12');
    expect(inputs[1].value).toBe('45');
  });

  test('input edge cases (negative, over max, invalid)', () => {
    render(<PomodoroTimer />);
    const [minInput, secInput] = screen.getAllByRole('spinbutton');

    fireEvent.change(minInput, { target: { value: '-5' } });
    expect(minInput.value).toBe('0');

    fireEvent.change(secInput, { target: { value: '100' } });
    expect(secInput.value).toBe('59');

    fireEvent.change(secInput, { target: { value: 'abc' } });
    expect(secInput.value).toBe('0');
  });

  test('pause sends chrome.runtime message (branch)', () => {
    chrome.storage.local.get.mockImplementationOnce((_, cb) => cb({ isRunning: true }));
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByText(/pause/i));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'pause' });
  });
});


test('auto-reset logic is triggered on mount when timer is 0:00 and not running', async () => {
  chrome.storage.local.get.mockImplementationOnce((_, cb) => {
    cb({ minutes: 0, seconds: 0, isRunning: false });
  });

  render(<PomodoroTimer />);

  await waitFor(() => {
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith("Auto-resetting timer to 25:00 after completion");
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ minutes: 25, seconds: 0 });
  });
});

test('covers auto-reset block when timer is 0:00 and not running on mount', async () => {
  const mockSet = jest.fn();

  // Set up the mock BEFORE component renders
  global.chrome.storage.local.set = mockSet;

  // Mock initial storage with timer done
  global.chrome.storage.local.get.mockImplementationOnce((_, cb) => {
    cb({ minutes: 0, seconds: 0, isRunning: false });
  });

  render(<PomodoroTimer />);

  await waitFor(() => {
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  // ✅ Only assert the object passed — no callback
  expect(mockSet).toHaveBeenCalledWith({ minutes: 25, seconds: 0 });
  expect(console.log).toHaveBeenCalledWith("Auto-resetting timer to 25:00 after completion");
});


test('auto-resets timer when minutes and seconds are 0 and isRunning is false', async () => {
  const mockSet = jest.fn();

  // Inject mock before render
  global.chrome.storage.local.set = mockSet;

  // This will trigger the auto-reset block
  global.chrome.storage.local.get.mockImplementationOnce((_, cb) => {
    cb({ minutes: 0, seconds: 0, isRunning: false });
  });

  render(<PomodoroTimer />);

  await waitFor(() => {
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  // Test that the reset logic was executed
  expect(mockSet).toHaveBeenCalledWith({ minutes: 25, seconds: 0 });
  expect(console.log).toHaveBeenCalledWith("Auto-resetting timer to 25:00 after completion");
});


test('clamps invalid or negative minute input to 0', () => {
  render(<PomodoroTimer />);
  const [minutesInput] = screen.getAllByRole('spinbutton');

  fireEvent.change(minutesInput, { target: { value: '-10' } });
  expect(minutesInput.value).toBe('0');

  fireEvent.change(minutesInput, { target: { value: 'abc' } });
  expect(minutesInput.value).toBe('0');

  fireEvent.change(minutesInput, { target: { value: '' } });
  expect(minutesInput.value).toBe('0');
});

// Added tests for pomodoro study log timer functionality

test('displays message when no study sessions today', async () => {
  chrome.storage.local.get.mockImplementationOnce((_, cb) => {
    cb({ pomodoroLogs: [], pomodoroPastLogs: [] });
  });

  render(<PomodoroTimer />);
  fireEvent.click(screen.getByText(/Daily/i));

  await waitFor(() => {
    expect(screen.getByText(/No study sessions today/i)).toBeInTheDocument();
  });
});

test('toggles mute/unmute state correctly', async () => {
  render(<PomodoroTimer />);
  const button = screen.getByRole('button', { name: /🔊|🔇/ });

  fireEvent.click(button); // toggle mute
  expect(button.textContent).toBe("🔇");

  fireEvent.click(button); // toggle back
  expect(button.textContent).toBe("🔊");
});

test('renders today’s logs when present', async () => {
  const now = new Date();
  const timestamp = now.toISOString();

  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({
      pomodoroLogs: [{ type: "work", timestamp, durationMinutes: 50 }],
      pomodoroPastLogs: [],
      minutes: 25,
      seconds: 0,
      isRunning: false
    });
  });

  render(<PomodoroTimer />);
  await screen.findByText(/Total Time Studied/);

  expect(screen.getByText(/Studied for 50 mins/)).toBeInTheDocument();
});


test('switches between Daily and Weekly tabs and renders respective content', async () => {
  const today = new Date().toISOString();

  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({
      pomodoroLogs: [{ type: "work", timestamp: today, durationMinutes: 25 }],
      pomodoroPastLogs: [],
      minutes: 25,
      seconds: 0,
      isRunning: false
    });
  });

  render(<PomodoroTimer />);

  // Wait for daily tab to render
  expect(await screen.findByText(/Total Time Studied/i)).toBeInTheDocument();

  // Click Weekly tab and wait for Week section
  fireEvent.click(screen.getByText(/Weekly/i));
  expect(await screen.findByText(/Week of/i)).toBeInTheDocument();

  // Click back to Daily tab
  fireEvent.click(screen.getByText(/Daily/i));
  expect(await screen.findByText(/Total Time Studied/i)).toBeInTheDocument();
});


test('renders weekly summary and expands when clicked', async () => {
  const logTime = new Date('2025-04-28T12:00:00.000Z').toISOString(); // Monday

  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({
      pomodoroLogs: [{ type: "work", timestamp: logTime, durationMinutes: 30 }],
      pomodoroPastLogs: [],
      minutes: 25,
      seconds: 0,
      isRunning: false
    });
  });

  render(<PomodoroTimer />);
  fireEvent.click(screen.getByText(/Weekly/i));

  const weekHeader = await screen.findByText(/Week of/i);
  expect(weekHeader).toBeInTheDocument();

  fireEvent.click(weekHeader);

  const allDays = await screen.findAllByText(/Monday:|Tuesday:/i);
  expect(allDays.length).toBeGreaterThan(0); // or:
  expect(allDays[0]).toBeInTheDocument();
});


test('toggles mute state and updates alarmRef', () => {
  render(<PomodoroTimer />);
  const button = screen.getByRole('button', { name: /🔊/ });

  // Click to mute
  fireEvent.click(button);
  expect(button).toHaveTextContent('🔇');

  // Click to unmute
  fireEvent.click(button);
  expect(button).toHaveTextContent('🔊');
});


test('renders weekly summary container even if logs are empty', async () => {
  chrome.storage.local.get.mockImplementation((_, cb) => {
    cb({
      pomodoroLogs: [],
      pomodoroPastLogs: [],
      minutes: 25,
      seconds: 0,
      isRunning: false
    });
  });

  render(<PomodoroTimer />);
  fireEvent.click(screen.getByText(/Weekly/i));

  const container = await screen.findByText(/Your Study Log/);
  expect(container).toBeInTheDocument();
});
