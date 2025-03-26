console.log("Pomodoro Timer background script loaded.");

let minutes = 25;
let seconds = 0;
let isRunning = false;
let timerInterval = null;

// Load state from storage when the background script starts
chrome.storage.local.get(["minutes", "seconds", "isRunning"], (data) => {
  if (data.minutes !== undefined) minutes = data.minutes;
  if (data.seconds !== undefined) seconds = data.seconds;
  if (data.isRunning !== undefined) isRunning = data.isRunning;

  // If the timer was running before the extension closed, restart it
  if (isRunning) {
    startTimer(); // Resume timer if it was running
  }
});

// Function to start the timer
function startTimer() {
  if (isRunning || timerInterval) return;

  isRunning = true;
  chrome.storage.local.set({ isRunning: true });

  timerInterval = setInterval(() => {
    if (minutes === 0 && seconds === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      chrome.storage.local.set({ isRunning: false });

      // Notify user
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Pomodoro Timer",
        message: "Time's up! Take a break!",
      });

      return;
    }

    if (seconds === 0) {
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }

    chrome.storage.local.set({ minutes, seconds });
  }, 1000);
}

// Function to pause the timer
function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  chrome.storage.local.set({ isRunning: false });
}

// Function to reset the timer
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  minutes = 25;
  seconds = 0;
  isRunning = false;
  chrome.storage.local.set({ minutes, seconds, isRunning: false });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") startTimer();
  if (request.action === "pause") pauseTimer();
  if (request.action === "reset") resetTimer();
  if (request.action === "getStatus") {
    sendResponse({ minutes, seconds, isRunning });
  }
});
