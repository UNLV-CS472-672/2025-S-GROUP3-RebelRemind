/**
 * NotificationHistory Component
 * --------------------------------------
 * Displays a list of past notifications stored in Chrome local storage.
 *
 * Upon mounting, this component fetches the `notificationHistory` array from
 * `chrome.storage.local` and renders it in a styled toast format using Bootstrap classes.
 * Each toast contains:
 *  - A date
 *  - A summary
 *  - A list of associated events with optional links
 *
 * If no notifications are available, a fallback message is shown.
 *
 * Dependencies:
 * - Requires "notificationHistory" to be an array of entries structured as:
 *   {
 *     id: string;
 *     date: string;
 *     summary: string;
 *     events: Array<{
 *       source: string;
 *       name?: string;
 *       title?: string;
 *       time: string;
 *       link?: string;
 *     }>
 *   }
 *
 * Example usage:
 * ```jsx
 * <NotificationHistory />
 * ```
 *
 * Note:
 * This component is intended for use inside a Chrome Extension environment
 * where `chrome.storage.local` is available.
 *
 * @component
 * @author Billy Estrada
 * Prompted ChatGPT for dynamic UI of notification 
 */
import React, { useEffect, useState } from "react";

const NotificationHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("notificationHistory", (data) => {
      if (Array.isArray(data.notificationHistory)) {
        setHistory(data.notificationHistory);
      }
    });
  }, []);

  if (history.length === 0) {
    return <p className="text-muted">No notifications yet</p>;
  }

  return (
    <div className="d-flex flex-column gap-3 w-100">
      {history.map((entry) => (
        <div className="toast show w-100" key={entry.id}>
          <div className="toast-header">
            <strong className="me-auto">📅 {entry.date}</strong>
            <small className="text-muted ms-2">{entry.summary}</small>
          </div>
          <div className="toast-body">
            <ul className="mb-0 ps-3">
              {entry.events.map((event, i) => (
                <li key={i}>
                  <strong>{event.source}:</strong> {event.name || event.title} — {event.time}
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noreferrer"
                      className="ms-1"
                    >
                      ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationHistory;
