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
 * Note:
 * This component is intended for use inside a Chrome Extension environment
 * where `chrome.storage.local` is available.
 *
 * @component
 * @author Billy Estrada
 * Prompted ChatGPT for dynamic UI of notification 
 */
import React, { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from "./css/Toast.module.css";
import Events from "../components/Events";
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
    <Accordion defaultActiveKey="0">
      {history.map((entry, idx) => (
        <Accordion.Item eventKey={idx.toString()} key={entry.id}>
          <Accordion.Header>
            📅 {entry.date} — {entry.summary}
          </Accordion.Header>
          <Accordion.Body className="accordion-panel-scroll">
            {entry.events && entry.events.length > 0 ? (
              <Events events={entry.events} viewMode={"daily"} />
            ) : (
              <p className={styles.textMuted}>No events for this notification.</p>
            )}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default NotificationHistory;
