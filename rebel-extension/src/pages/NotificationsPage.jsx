/**
 * Notifications Page
 * --------------------------------------
 * This page displays the full notification history using the `NotificationHistory` component.
 * 
 * Layout:
 * - Fullscreen background styled via `NotificationsPage.css`, with an overlay applied.
 * - A central container displays:
 *   - Page title: "Rebel Remind Notifications"
 *   - A scrollable area for the list of notifications (rendered using `NotificationHistory`)
 *
 * Features:
 * - Uses Bootstrap for consistent UI styling (`toast` elements, spacing, typography).
 * - Notification history is pulled from `chrome.storage.local` within `NotificationHistory`.

 * @component
 * @file Notifications.jsx
 * @author Billy Estrada
 */

import React from "react";
import NotificationHistory from "../components/NotificationHistory";
import "./css/NotificationsPage.css";
// import "bootstrap/dist/css/bootstrap.min.css";

const Notifications = () => {
  return (
  <div className="page-background">
    <div className="notification-container" style={{ padding: "1rem", height: "80vh", overflowY: "hidden" }}>
      <h1 className="page-title">Rebel Remind Notifications</h1>
      <div className="toast-scroll-area">
        <NotificationHistory />
      </div>
    </div>
  </div>
  );
};

export default Notifications;
