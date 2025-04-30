import React from "react";


const formatTime = (timeStr) => {
    if (!timeStr || timeStr.trim() === "") return "Time TBD";
    const [hour, minute] = timeStr.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

/**
* Safely parses a YYYY-MM-DD string into a local Date object.
*/
const parseDateLocal = (yyyyMmDd) => {
    const [year, month, day] = yyyyMmDd.split("-").map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Converts a date string into a readable format (e.g. March 25, 2025).
*/
const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = parseDateLocal(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};


function UserEventPopup({ event, onClose, popupRef }) {
    if (!event) return null;

    return (
        <div
            ref={popupRef}
            style={{
                position: "absolute",
                top: "60%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 9999,
                background: "white",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                width: "300px",
                maxHeight: "70vh",
                overflowY: "auto",
                color: "black",
            }}
        >
            <h5 style={{ marginTop: 0, marginBottom: "0.5rem" }}>📝 Your Event</h5>
            <p><strong>Title:</strong> {event.name || "N/A"}</p>
            <p><strong>Date:</strong> {formatDate(event.startDate) || "N/A"}</p>
            <p><strong>Time:</strong> {event.allDay
                ? "All-day"
                : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}</p>
            <p><strong>Location:</strong> {event.location || "N/A"}</p>
            <p><strong>Description:</strong> {event.desc || "No description."}</p>

            <button
                onClick={onClose}
                style={{
                    marginTop: "0.5rem",
                    background: "#8b0000",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
            >
                Close
            </button>
        </div>
    );
}

export default UserEventPopup;
