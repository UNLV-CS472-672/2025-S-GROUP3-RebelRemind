export async function fetchEvents(today, viewMode="daily") {
  try {
    const [res1, res2, res3, res4] = await Promise.all([
      fetch(`http://franklopez.tech:5050/academiccalendar_${viewMode}/${today}`),
      fetch(`http://franklopez.tech:5050/involvementcenter_${viewMode}/${today}`),
      fetch(`http://franklopez.tech:5050/rebelcoverage_${viewMode}/${today}`),
      fetch(`http://franklopez.tech:5050/unlvcalendar_${viewMode}/${today}`)
    ]);

    const [data1, data2, data3, data4] = await Promise.all([
      res1.json(), res2.json(), res3.json(), res4.json()
    ]);
    return [data1, data2, data3, data4];
  } catch (err) {
    console.error('Error fetching events:', err);
    return [null, null, null, null];
  }
}

  /**
     * Loads all user-defined events from Chrome local storage on mount,
     * and subscribes to runtime messages for real-time syncing.
  */
  
export function subscribeToUserEvents(setUserEvents) {
  const loadEvents = () => {
    chrome.storage.local.get("userEvents", (data) => {
      if (Array.isArray(data["userEvents"])) {
        setUserEvents(data["userEvents"]);
      }
    });
  };

  loadEvents();

  const handleMessage = (message) => {
    if (message.type === "EVENT_CREATED") {
      console.log("🔁 Reloading from background after event update...");
      loadEvents();
    }
  };

  chrome.runtime.onMessage.addListener(handleMessage);

  return () => {
    chrome.runtime.onMessage.removeListener(handleMessage);
  };
}

// helper function
function formatTime(timeStr) {
  if (!timeStr || timeStr.trim() === "") return "Time TBD";
  const [hour, minute] = timeStr.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

export function normalizeUserEvents(userEvents) {
  return userEvents.map((event) => ({
    id: -1,
    name: event.title || "Untitled Event",
    organization: "Your Event",
    time: event.allDay ? "(ALL DAY)" : formatTime(event.startTime),
    startDate: event.startDate,
    link: "customEvent",

    // Full metadata for popup
    allDay: event.allDay,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    desc: event.desc,
  }));
}
