import React from "react";
import NotificationHistory from "../components/NotificationHistory";
import "./css/NotificationsPage.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Notifications = () => {
  return (
  <div className="page-background">
    <div className="notification-container">
      <h1 className="page-title">Rebel Remind Notifications</h1>
      <div className="toast-scroll-area">
        <NotificationHistory />
      </div>
    </div>
  </div>
  );
};

export default Notifications;
