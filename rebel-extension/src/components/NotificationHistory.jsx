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
