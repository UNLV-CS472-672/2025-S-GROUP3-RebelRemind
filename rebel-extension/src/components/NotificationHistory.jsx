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
 *     startDate: string;
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
import styles from "./css/Toast.module.css";
import "./css/NotificationHistory.css";

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
    return <p className={styles.textMuted}>No notifications yet</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {history.map((entry) => (
        <div className={styles.toast} key={entry.id}>
          <div className={styles.toastHeader}>
            <strong className={styles.meAuto}>📅 {entry.date}</strong>
            <small className={`${styles.textMuted} ${styles.ms1}`}>{entry.summary}</small>
          </div>
          <div className={styles.toastBody}>
            <ul className={styles.ps3}>
              {entry.events.map((event, i) => (
                <li key={i}>
                  <strong>{event.source}:</strong> {event.name || event.title} — {event.startTime}
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.ms1}
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
