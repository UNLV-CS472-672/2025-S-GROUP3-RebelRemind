/**
 * @file notification.js
 * @description
 * Core logic module for Rebel Remind Chrome Extension that manages alarm scheduling,
 * storage-based triggers, notification display, and local event history logging.
 * 
 * 🔧 Responsibilities:
 * - Creates and manages a Chrome alarm (`dailyCheck`) that runs daily at 9:00 AM.
 * - Reacts to changes in `notificationsEnabled` from `chrome.storage.sync`.
 * - Handles fallback logic during Chrome startup if the alarm was missed.
 * - Fetches event and assignment data and constructs dynamic notification messages.
 * - Logs the notification metadata in local storage for history tracking.
 * - Opens the notification center when a user clicks on the notification.
 * 
 * 📦 Dependencies:
 * - `fetchEvents(todayDate)` from `fetch-events.js` — Retrieves events from four external sources.
 * - `checkDailyTask()` from `check-daily-login.js` — Prevents duplicate notification runs per day.
 * - `chrome.*` APIs: alarms, storage, notifications, tabs, runtime.
 * 
 * ⚠️ Assumptions:
 * - A shared reactive `notificationState` exists in scope or is imported from another file (not declared here).
 * - Event sources return `startDate` and `startTime` fields in compatible formats.
 * - Canvas assignments contain a valid `due_at` ISO timestamp.
 * 
 * 📤 Exports:
 * - `alarmInstall()` — Creates daily alarm on install.
 * - `storageListener(changes, areaName)` — Responds to notification toggle.
 * - `chromeStartUpLisener()` — Runs daily logic if Chrome started late.
 * - `dailyAlarmListener(alarm)` — Called when the `dailyCheck` alarm fires.
 * - `onClickNotification(notificationId)` — Opens notification history view.
 * - `handleDailyTask(isStartup)` — Core function that drives notification creation and storage logging.
 */
import { fetchEvents } from "./fetch-events.js";
import { checkDailyTask } from "./check-daily-login.js";

// Helper function
function getNextNineAM() {
    const now = new Date();
    const next = new Date();
    next.setHours(9, 0, 0, 0);
    if (now > next) {
      next.setDate(next.getDate() + 1); // schedule for tomorrow
    }
    return next.getTime();
}

export function alarmInstall() {
  console.log("Extension installed: Create alarm");

  chrome.alarms.create("dailyCheck", {
    when: getNextNineAM(),
    periodInMinutes: 1440 //24 hours
    // periodInMinutes: 1 //24 hours
  });
}

export function storageListener(changes, areaName){
  if (areaName === "sync" && changes.notificationsEnabled){
    // Utility to calculate the next 9:00 AM time
    let notificationState = changes.notificationsEnabled.newValue;
    if (notificationState){
      chrome.alarms.get("dailyCheck", (alarm) => {
        if (!alarm) {
          // Alarm doesn't exist, so create it
          chrome.alarms.create("dailyCheck", {
            when: getNextNineAM(),
            periodInMinutes: 1440 // 24 hours
          });
          console.log("Alarm created.");
        } else {
          console.log("Alarm already exists:", alarm);
        }
      });
      console.log("Notify from changed preferences")
      handleDailyTask();
    }
    else {
      chrome.alarms.clear("dailyCheck", (wasCleared) =>{
        if (wasCleared){
          console.log("Alarm should not be on");
        }
        else{
          console.log("Somethingn went wrong clearing the alarm");
        }
      })
    }
  }
}

export function chromeStartUpListener(){
  const currentHour = new Date().getHours();
  
    let notificationState = false;
    chrome.storage.sync.get("notificationsEnabled", (data) => {
        if (data && data.notificationsEnabled !== undefined) {
        notificationState = data.notificationsEnabled;
        } else {
        notificationState = false;
        }
    });
  console.log("Chrome started at", currentHour);
  if (currentHour >= 9 && notificationState) {
    console.log("Notify from chrome startup")
    handleDailyTask(true); // after 9am is true
  }
}

export function dailyAlarmListener(alarm){
    let notificationState = false;
    chrome.storage.sync.get("notificationsEnabled", (data) => {
        if (data && data.notificationsEnabled !== undefined) {
        notificationState = data.notificationsEnabled;
        } else {
        notificationState = false;
        }
    });
  if (alarm.name === "dailyCheck") {
    if (notificationState){
      console.log("Notify daily 9am")
      handleDailyTask();
    }
    else{
      chrome.alarms.clear("dailyCheck", (wasCleared) =>{
        if (wasCleared){
          console.log("Alarm should not be on");
        }
        else{
          console.log("Somethingn went wrong clearing the alarm");
        }
      })
    }
  }
}

export function onClickNotification(notificationId) {
    if (notificationId === "rebel-remind") {
      chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html#/notifications")
      });
    }
  }
  

export async function handleDailyTask() {
  try {
    const shouldRun = await checkDailyTask();
    const currentHour = new Date().getHours();
    let notificationState = false;
    chrome.storage.sync.get("notificationsEnabled", (data) => {
        if (data && data.notificationsEnabled !== undefined) {
        notificationState = data.notificationsEnabled;
        } else {
        notificationState = false;
        }
    });

    // Only run if the task hasn't already run, and it's after 9AM (if startup fallback)
    if (shouldRun) {
      console.log("Triggering daily task");

      const fetchAssignments = async () => {
        return new Promise((resolve) => {
          chrome.storage.local.get("Canvas_Assignments", (data) => {
            if (Array.isArray(data.Canvas_Assignments)) {
              resolve(data.Canvas_Assignments);
            } else {
              resolve([]);
            }
          });
        });
      };
      
      const assignmentList = await fetchAssignments();

      //Constants do not touch
      const now = new Date();
      const todayForFetching = now.toLocaleDateString('en-CA')
      const filterToday = (arr) =>
        safeArray(arr).filter(event => {
          if (!event.startDate || !event.startTime) return false;

          const isAllDay = event.startTime === "(ALL DAY)";
          if (event.startDate !== todayForFetching) return false;
          if (isAllDay) return true;
          
          const dateTime = new Date(`${event.startDate} ${event.startTime}`); 
          return dateTime > now;
        });
      const filterTodayCanvas = (arr) =>
        safeArray(arr).filter(item => {
          if (!item.due_at) return false;
      
          const dueDate = new Date(item.due_at);
          const localDateStr = dueDate.toLocaleDateString('en-CA'); 
          
          return localDateStr === todayForFetching && dueDate > now;
        });

      //Basically error check if a response is valid
      const safeArray = (data) => Array.isArray(data) ? data : [];

      //Check incoming fetched events
      const [data1, data2, data3, data4] = await fetchEvents(todayForFetching);

      const academiccalendar_daily = filterToday(data1).length;
      const involvementcenter_daily = filterToday(data2).length;
      const rebelcoverage_daily = filterToday(data3).length;
      const unlvcalendar_daily = filterToday(data4).length;
      const canvas_daily = filterTodayCanvas(assignmentList).length;

      const allEvents = [...safeArray(data1), ...safeArray(data2), ...safeArray(data3), ...safeArray(data4)];

      const eventsToday = academiccalendar_daily + involvementcenter_daily + rebelcoverage_daily + unlvcalendar_daily + canvas_daily > 0;
      console.log("Events today", eventsToday);
      const parts = [];

      if (canvas_daily > 0) {
        parts.push(`${canvas_daily} Canvas ${canvas_daily === 1 ? 'assignment' : 'assignments'}`);
      }

      if (academiccalendar_daily > 0) {
        parts.push(`${academiccalendar_daily} Academic ${academiccalendar_daily === 1 ? 'event' : 'events'}`);
      }

      if (involvementcenter_daily > 0) {
        parts.push(`${involvementcenter_daily} Involvement Center ${involvementcenter_daily === 1 ? 'event' : 'events'}`);
      }

      if (rebelcoverage_daily > 0) {
        parts.push(`${rebelcoverage_daily} Rebel Coverage ${rebelcoverage_daily === 1 ? 'event' : 'events'}`);
      }

      if (unlvcalendar_daily > 0) {
        parts.push(`${unlvcalendar_daily} UNLV ${unlvcalendar_daily === 1 ? 'event' : 'events'}`);
      }

      const dynamicTitle = parts.join(', ');

      if (eventsToday){
        chrome.notifications.create('rebel-remind', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL("images/logo_128x128.png"), // must exist and be declared in manifest.json
          title: "RebelRemind",
          message: dynamicTitle,
          priority: 2
        }, (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error('Notification error:', chrome.runtime.lastError.message);
          } else {
            console.log('Notification shown with ID:', notificationId);
          }
        });
      }
      else{
        chrome.storage.local.set({ lastRunDate: todayForFetching }, () => {
          resolve(false);
        });
      }

    //schema 
      const notificationData = {
        id: Date.now().toString(),
        startDate: todayForFetching,
        summary: dynamicTitle,
        events: [
          ...filterToday(data1).map(e => ({ ...e, source: "Academic" })),
          ...filterToday(data2).map(e => ({ ...e, source: "Involvement Center" })),
          ...filterToday(data3).map(e => ({ ...e, source: "Rebel Coverage" })),
          ...filterToday(data4).map(e => ({ ...e, source: "UNLV Calendar" })),
          ...filterTodayCanvas(assignmentList).map(e => ({ ...e, source: "Canvas" })),
        ]
      };
    
    // Push to local store
      chrome.storage.local.get("notificationHistory", (data) => {
        const history = Array.isArray(data.notificationHistory) ? data.notificationHistory : [];
        history.unshift(notificationData);
        chrome.storage.local.set({ notificationHistory: history.slice(0, 7) }); // Last 7 days
      });

    } else {
      console.log("Daily task skipped (already run or too early)");
    }
  } catch (error) {
    console.error("Error during daily task execution:", error);
  }

}