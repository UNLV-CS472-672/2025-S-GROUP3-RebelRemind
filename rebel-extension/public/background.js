/**
 * Background Script for Chrome Extension
 *
 * This script initializes the Chrome extension, listens for events, and handles background tasks
 * such as authentication, message passing, and user preferences storage.
 *
 * Handles:
 * - Extension installation event
 * - Message listeners for handling user authentication, preferences, and Canvas API token retrieval.
 *
 * Documentation generated by ChatGPT
 */

import { authenticateUser } from "./scripts/identity-script.js";
import { getAssignments, getCourses, getCanvasPAT } from "./scripts/canvas-script.js";
import { openSidePanel } from "./scripts/sidepanel.js";

// background.js
/**
 * Listens for the Chrome extension installation event.
 * This event triggers once when the extension is installed or updated.
 * Used to initialize default settings or guide users on first install.
 */
let timerInterval;
let isRunning = false;
let minutes = 25;
let seconds = 0;

// Initialize default timer state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ minutes: 25, seconds: 0, isRunning: false });
});

// Start the timer
// Start the timer
function startTimer() {
  if (isRunning) return;

  chrome.storage.local.get(["minutes", "seconds"], (data) => {
    minutes = data.minutes ?? 25;
    seconds = data.seconds ?? 0;
  });

  isRunning = true;

  timerInterval = setInterval(() => {
    if (minutes === 0 && seconds === 0) {
      clearInterval(timerInterval);
      isRunning = false;
      chrome.storage.local.set({ isRunning: false });

      // ✅ Show timer-up notification directly (not in a nested listener)
      chrome.notifications.create("timerDone", {
        type: "basic",
        title: "Pomodoro Timer",
        message: "Timer is up! Time to take a break!"
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

// Pause the timer
function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  chrome.storage.local.set({ isRunning: false });
}

// Reset the timer with a custom time
function resetTimer(customMinutes = 25) {
  clearInterval(timerInterval);
  isRunning = false;
  minutes = customMinutes;
  seconds = 0;
  chrome.storage.local.set({ minutes, seconds, isRunning: false });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || typeof request !== "object") {
    console.warn("Invalid message received:", request);
    return;
  }

  const action = request.action;

  if (action === "start") startTimer();
  else if (action === "pause") pauseTimer();
  else if (action === "reset") resetTimer(request.minutes || 25);
  else if (action === "getStatus") {
    sendResponse({ minutes, seconds, isRunning });
  } else if (action === "timeUpNotification") {
    // Redundant now, but preserved if future use case arises
    chrome.notifications.create("timerDone", {
      type: "basic",
      title: "Pomodoro Timer",
      message: "Timer is up! Time to take a break!"
    });
  } else {
    console.warn("Received unknown message action:", action);
  }
});



// // Floating timer Pomodoro feature
// let floatingWindowId = null;

// function openFloatingTimerWindow() {
//   if (floatingWindowId !== null) return;

//   chrome.system.display.getInfo((displays) => {
//     const screen = displays[0].workArea;
//     const width = 260;
//     const height = 150;

//     const left = screen.left + screen.width - width - 20; // 20px margin from right
//     const top = screen.top + screen.height - height - 40; // 40px margin from bottom

//     chrome.windows.create({
//       url: chrome.runtime.getURL("floating-timer.html"),
//       type: "popup",
//       width,
//       height,
//       left,
//       top,
//       focused: false
//     }, (win) => {
//       floatingWindowId = win.id;

//       chrome.windows.onRemoved.addListener((closedWindowId) => {
//         if (closedWindowId === floatingWindowId) {
//           floatingWindowId = null;
//         }
//       });
//     });
//   });
// }



/**
 * This section is meant to handle all functions that need to be ran when the user logs into Chrome
 *
 * If you want to set a function to only run the first time of the day they are logged into Chrome, use
 * within the if statement
 *
 * If you want the function to run everytime they log into Chrome, place outside the if statement
 *
 * If you need something to run everytime the pop up is open, you can add it in the App.jsx for the pop up, Or
 * add a functionality in the frontend to call a script here.
 */
// chrome.runtime.onStartup.addListener(() => {
//   if (checkDailyTask()) {
//     // Functions only to be done once a day.
//     // I don't recommend Canvas or assignments because Professors might add new stuff midday so we should update as much as possible.
//   }
//   // Functions that should be ran anytime the user logins to Google. Will be run in background.
//   //
// });

//region Message Listener

/**
 * Handles incoming messages from content scripts, popup scripts, or other parts of the extension.
 * Uses a `switch` statement to route different message types to the appropriate handlers.
 *
 * @param {Object} message - The message object sent from a content script, popup, or other background processes.
 * @param {Object} sender - The sender of the message (not used directly here).
 * @param {Function} sendResponse - The callback function to send a response back to the sender.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type) return; // ⛔ skip if it's a Pomodoro-style message
  switch (message.type) {
    /**
     * Retrieves the user's schedule from a background API.
     */
    case "GET_ASSIGNMENTS":
      let allAssignments = [];
      
      // Await access token before continuing
      getCanvasPAT().then((accessToken) => {
        if (!accessToken) {
          console.error("No access token found.");
          sendResponse(false);
          return;
        }

        getCourses(accessToken).then((courseList) => {
          // Loop through the courses and fetch assignments
          const assignmentPromises = courseList.map((course) =>
            getAssignments(course, accessToken)
          );
          
          // Wait for all assignments to be fetched
          Promise.all(assignmentPromises)
            .then((assignments) => {
              // Flatten the array
              allAssignments = assignments.flat();
              chrome.storage.local.set({ Canvas_Assignments: allAssignments }, () => {
                console.log("Assignments Stored!");
              });
              sendResponse(allAssignments); // Send the response with all assignments
            })
            .catch((error) => {
              console.error("Error fetching assignments", error);
              sendResponse(false);
            });
        }).catch((error) => {
          console.error("Error with getCourses()", error);
          sendResponse(false);
        });
      }).catch((error) => {
        console.error("Error fetching access token", error);
        sendResponse(false);
      });
      return true;

    /**
     * Initiates user authentication.
     * Calls `authenticateUser()` to handle authentication logic.
     */
    case "LOGIN":
      authenticateUser(sendResponse);
      return true;

    /**
     * Checks if the user is authenticated.
     * Retrieves authentication state from `chrome.storage.sync`.
     */
    case "CHECK_AUTH":
      chrome.storage.sync.get("user", (data) => {
        sendResponse({ isAuthenticated: !!data.user }); // Returns `true` if a user is logged in.
      });
      return true;

    /**
     * Retrieves stored user preferences.
     * Preferences are stored in `chrome.storage.sync` under the "preferences" key.
     */
    case "GET_PREFERENCES":
      chrome.storage.sync.get("preferences", (data) => {
        sendResponse({ preferences: data.preferences || {} }); // Returns preferences or an empty object if none exist.
      });
      return true;

    /**
     * Saves user preferences to Chrome storage.
     * Preferences are provided in the `message.preferences` object.
     */
    case "SAVE_PREFERENCES":
      chrome.storage.sync.set({ preferences: message.preferences }, () => {
        console.log("Preferences saved to storage:", message.preferences);
        sendResponse({ success: true }); // Confirms successful storage update.
      });
      return true;

    /**
     * Retrieves the Canvas Personal Access Token (PAT) from `chrome.storage.local`.
     * Returns `null` if no token is found.
     */
    case "GET_CANVAS_PAT":
      chrome.storage.local.get("canvasPAT", (data) => {
        sendResponse({ token: data.canvasPAT || null });
      });
      return true;

    /**
     * Opens the side panel and closes the popup`.
     */
    case "OPEN_SIDEPANEL":
      openSidePanel(sendResponse);
      return true;

    /**
     * Reloads "Your Custom Events" list in UserEventsPage by broadcasting message from UserEventInput.jsx
     */
    case "EVENT_CREATED":
      chrome.runtime.sendMessage({ type: "EVENT_CREATED" }); // broadcast
      break;

    case "EVENT_UPDATED":
      chrome.runtime.sendMessage({ type: "EVENT_UPDATED" });
      break;

    /**
     * Default case: Logs an unrecognized message type.
     * Helps with debugging unexpected messages.
     */
    default:
      console.warn("Received unknown message type:", message.type);
      break;
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onDisconnect.addListener(() => {
      chrome.storage.local.get("isRunning", ({ isRunning }) => {
        if (isRunning) {
          // ✅ Timer is still running — you can trigger widget logic here
          console.log("[Background] Popup closed while timer running — widget logic could go here.");
        }
      });
    });
  }
});