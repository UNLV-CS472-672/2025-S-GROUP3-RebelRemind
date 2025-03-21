import React, { useState } from "react";
import WeeklyReminders from "./WeeklyReminders";
import DailyReminders from "./DailyReminders";
// ai-get start (ChatGPT-4o, 2)

// 🔸 Main component with buttons and logic
function DailyOrWeeklyPanel() {
  const [activeSide, setActiveSide] = useState("left");

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveSide("left")}
          style={{
            marginRight: "0.5rem",
            backgroundColor: activeSide === "left" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
          }}
        >
          Daily Reminders
        </button>
        <button
          onClick={() => setActiveSide("right")}
          style={{
            backgroundColor: activeSide === "right" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
          }}
        >
          WeeklyReminders
        </button>
      </div>

      {/* Conditional render */}
      {activeSide === "left" ? <DailyReminders /> : <WeeklyReminders />}
    </div>
  );
}

export default DailyOrWeeklyPanel;
// ai-get end (ChatGPT-4o, 2)
