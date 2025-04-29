/**
 * Script for Handling Google Calendar API Requests
 *
 * This script contains a function for 
 * It does not contain event listeners, as they are managed in background.js.
 *
 * Authored by: Gunnar Dalton
 */

/**
 * 
 */
export function getGoogleToken() {
    return new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.log("Error getting token");
                resolve(false);
            }
            else {
                resolve(token);
            }
        });
    });
}

/**
 * 
 */
export async function getCalendarID() {
    return new Promise((resolve) => {
        chrome.storage.local.get("GoogleCalendarID", (data) => {
            if (data.GoogleCalendarID) { 
                resolve(data.GoogleCalendarID);
            } else { 
                console.log("No calendar ID in storage.")
                resolve(false);
            }
        });
    });
}

/**
 * 
 */
export async function checkCalendarExists(token, calendarID) {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}`;
    const response = await fetch (url, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.status == 404) {
        console.log("No calendar found.");
        return false;
    }
    return true;
}

/**
 * 
 */
export async function getOrCreateCalendar(token) {
    let url = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
    const calendarListResponse = await fetch (url, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const calendarList = await calendarListResponse.json();

    let foundCalendar = calendarList.items.find(calendar => calendar.summary === "Rebel Remind");
    if (foundCalendar) {
        chrome.storage.local.set({ GoogleCalendarID: foundCalendar.id });
        return foundCalendar.id;
    }
    else {
        url = "https://www.googleapis.com/calendar/v3/calendars";
        const createResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                summary: "Rebel Remind",
                timeZone: "America/Los_Angeles"
            })
        });
        const newCalendar = await createResponse.json();
        chrome.storage.local.set({ GoogleCalendarID: newCalendar.id });
        return newCalendar.id;
    }
}

/**
 * 
 */
export async function gatherEvents() {
    // user events, Canvas, filtered Involvement center, saved UNLV events

    const getCanvas = new Promise((resolve) => {
        chrome.storage.local.get("Canvas_Assignments", (data) => {
            if (data.Canvas_Assignments) {
                const originalAssignments = data.Canvas_Assignments;
                const newAssignments = originalAssignments.flatMap((assignment) => {
                    if (!assignment.due_at) {
                        return [];
                    }
                    return [{
                    summary: assignment.title,
                    description: assignment.context_name,
                    id: "assignment" + assignment.id,
                    start: {
                        dateTime: assignment.due_at,
                        timeZone: "America/Los_Angeles"
                    },
                    end: {
                        dateTime: assignment.due_at,
                        timeZone: "America/Los_Angeles"
                    },
                    extendedProperties: {
                        private: {
                            managedBy: "Rebel Remind"
                        }
                    }
                    }];
                });
                resolve(newAssignments);
            }
            else {
                resolve([]);
            }
        });
    });

    const getUserEvents = new Promise((resolve) => {
        chrome.storage.local.get("userEvents", (data) => {
            if (data.userEvents) {
                const originalUserEvents = data.userEvents;
                const newUserEvents = originalUserEvents.map(event => ({
                    summary: event.title,
                    id: `userevent${eventHash(event.title, event.date)}`,
                    description: event.desc,
                    start: {
                        dateTime: event.allDay ? `${event.startDate}T00:00:00` : `${event.startDate}T${event.startTime}:00`,
                        timeZone: "America/Los_Angeles"
                    },
                    end: {
                        dateTime: event.allDay ? `${event.startDate}T00:00:00` : `${event.startDate}T${event.endTime}:00`,
                        timeZone: "America/Los_Angeles"
                    },
                    extendedProperties: {
                        private: {
                            managedBy: "Rebel Remind"
                        }
                    }
                }));
                resolve(newUserEvents);
            }
            else {
                resolve([]);
            }
        });
    });

    const getICEvents = new Promise ((resolve) => {
        chrome.storage.local.get("filteredIC", (data) => {
            if (data.filteredIC) {
                const originalICEvents = data.filteredIC;
                const newICEvents = originalICEvents.map(event => ({
                    summary: event.name,
                    id: `involvementcenter${eventHash(event.name, event.startDate)}`,
                    description: event.organization,
                    start: {
                        dateTime: (new Date(`${event.startDate} ${event.startTime}`)).toISOString(),
                        // timeZone: "America/Los_Angeles"
                    },
                    end: {
                        dateTime: (new Date(`${event.endDate} ${event.endTime}`)).toISOString(),
                        // timeZone: "America/Los_Angeles"
                    },
                    location: event.location,
                    extendedProperties: {
                        private: {
                            managedBy: "Rebel Remind"
                        }
                    }
                }));
                resolve(newICEvents);
            }
            else {
                resolve([]);
            }
        });
    });

    const getSavedUNLVEvents = new Promise ((resolve) => {
        chrome.storage.local.get("savedUNLVEvents", (data) => {
            if (data.savedUNLVEvents) {
                const originalUNLVEvents = data.savedUNLVEvents;
                const newUNLVEvents = originalUNLVEvents.map(event => {
                    return {
                        summary: event.name,
                        id: `unlvevent${eventHash(event.name, event.startDate)}`,
                        start: (event.startTime === "(ALL DAY)") ? { date: event.startDate } : { dateTime: (new Date(`${event.startDate} ${event.startTime}`)).toISOString() },
                        end: (event.endTime === "") ? (event.startTime === "(ALL DAY)") ? { date: event.endDate } : { dateTime: (new Date(`${event.startDate} ${event.startTime}`)).toISOString() } : { dateTime: (new Date(`${event.endDate} ${event.endTime}`)).toISOString() },
                        location: event.location,
                        extendedProperties: {
                        private: {
                            managedBy: "Rebel Remind"
                        }
                    }
                    };
                });
                resolve(newUNLVEvents);
            }
            else {
                resolve([]);
            }
        });
    });
    const [canvasEvents, userEvents, ICEvents, UNLVEvents] = await Promise.all([getCanvas, getUserEvents, getICEvents, getSavedUNLVEvents]);
    const combined = [...canvasEvents, ...userEvents, ...ICEvents, ...UNLVEvents];
    return combined;
}

/**
 * 
 */
// ai-gen start (ChatGPT-4o, 1)
function eventHash(title, date) {
    const preHashString = `${title}-${date}`;
    let hash = 0;
    for (let i = 0; i < preHashString.length; i++) {
        hash = (hash << 5) - hash + preHashString.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}
// ai-gen end

/**
 * 
 */
async function addOrUpdateEvents(token, calendarID, event) {
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?eventId=${event.id}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
    });
    
    if (response.status === 409) {
        let updateurl = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events/${event.id}`;
        await fetch (updateurl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(event)
        });
    }
}

/**
 * 
 */
async function getExistingEvents(token, calendarID) {
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?maxResults=2500`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const list = await response.json();
    return (list.items || []).filter(event => 
        event.extendedProperties?.private?.managedBy === "Rebel Remind"
    );
}

/**
 * 
 */
async function deleteEvent(token, calendarID, eventID) {
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events/${eventID}`
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}

/**
 * 
 */
export async function syncCalendar(events, token, calendarID) {
    const existingEvents = await getExistingEvents(token, calendarID);
    // ai-gen start (ChatGPT-4o, 1)
    const currentEventIDs = new Set(events.map(e => e.id));
    for (const existingEvent of existingEvents) {
        if (!currentEventIDs.has(existingEvent.id)) {
            await deleteEvent(token, calendarID, existingEvent.id);
        }
    }
    // ai-gen end
    for (const event of events) {
        await addOrUpdateEvents(token, calendarID, event);
    }
}

export async function testCreateEvent(token, calendarID) {
    const testEvent = {
        id: "testputevent45678", // This ID will allow us to PUT (update or insert)
        summary: "Test PUT Event",
        description: "This is a test event added using PUT",
        start: {
            dateTime: "2025-05-01T16:00:00-07:00", // Use full ISO with timezone offset
            timeZone: "America/Los_Angeles"
        },
        end: {
            dateTime: "2025-05-01T18:00:00-07:00",
            timeZone: "America/Los_Angeles"
        },
        extendedProperties: {
            private: {
                managedBy: "Rebel Remind"
            }
        }
    };

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events?eventId=${testEvent.id}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(testEvent)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Failed to PUT test event:", result);
        } else {
            console.log("✅ Successfully PUT test event:", result);
        }
    } catch (error) {
        console.error("❌ Error during testPutEvent:", error);
    }
}