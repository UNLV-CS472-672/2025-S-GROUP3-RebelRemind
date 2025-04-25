/**
 * Pomodoro Timer
 * 
 * This code implements a Pomodoro Timer with functionality to start, pause, reset,
 * and switch between short and long breaks. The timer uses React state and useEffect
 * hooks to manage the countdown and control the timer's flow.
 * 
 * Features Implemented:
 * - **Timer Countdown:** The timer starts at 25 minutes by default and counts down
 *   to 00:00, transitioning from minutes to seconds.
 * - **Start, Pause, and Reset:** Users can start, pause, or reset the timer to its
 *   initial 25-minute countdown.
 * - **Break Options:** Includes options to switch the timer to a 5-minute short break
 *   or a 15-minute long break.
 * - **Finish Alarm:** When the timer reaches 00:00, an audio alarm is played to
 *   indicate the end of the Pomodoro session or break.
 * - **State Management:** Uses React's useState and useEffect to manage timer state
 *   (minutes, seconds, running status), and play an alarm sound upon completion.
 * - **Audio Preload:** The audio file is preloaded to ensure smooth playback when
 *   the timer ends.
 * 
 * Author - Chandni Mirpuri Silva
 * 
 * Documentation provided by Chatgpt 
 * 
 * This implementation provides an interactive Pomodoro timer to improve productivity
 * and focus with audible reminders for the timer's completion.
 */

import React, { useState, useEffect, useRef } from "react";
import FinishAlarm from "../assets/FinishAlarm.mp3";
import "./css/Pomodoro.css";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa"; // added this for volume muter

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showEditBoxes, setShowEditBoxes] = useState(true);
  const [isTimerDone, setIsTimerDone] = useState(false);
  const alarmRef = useRef(new Audio(FinishAlarm));
  const [isMuted, setIsMuted] = useState(false);       // const to mute the volume

// Change the whole useEffect function because mute functionality was resetting
// to 25:00 and also was not unmutting after muting it.
// Handle just the audio mute toggle without affecting timer logic
useEffect(() => {
  alarmRef.current.muted = isMuted;
}, [isMuted]);

// Handle timer state on mount
useEffect(() => {
  chrome.storage.local.get(["minutes", "seconds", "isRunning"], (data) => {
    const isTimerDone = data.minutes === 0 && data.seconds === 0 && !data.isRunning;

    if (isTimerDone) {
      chrome.storage.local.set({ minutes: 25, seconds: 0 }); // Auto-reset
      setMinutes(25);
      setSeconds(0);
      setIsRunning(false);
      setShowEditBoxes(true);
      console.log("Auto-resetting timer to 25:00 after completion");
    } else {
      if (data.minutes !== undefined) setMinutes(data.minutes);
      if (data.seconds !== undefined) setSeconds(data.seconds);
      if (data.isRunning !== undefined) {
        setIsRunning(data.isRunning);
        setShowEditBoxes(!data.isRunning);
      }
    }
  });

  const handleStorageChange = (changes) => {
    if (changes.minutes) {
      setMinutes(changes.minutes.newValue);
    }
    if (changes.seconds) {
      setSeconds(changes.seconds.newValue);
    }
    if (changes.isRunning) {
      setIsRunning(changes.isRunning.newValue);
      setShowEditBoxes(!changes.isRunning.newValue);
    }
  };

  chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []); // ← empty dependency array = run only once on mount


  useEffect(() => {
    // console.log('Timer updated:', minutes, seconds, 'isRunning:', isRunning);
    if (minutes === 0 && seconds === 0 && isRunning) {
      console.log('Timer reached 0:00, triggering alarm...');
      alarmRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
      setIsRunning(false);
      setIsTimerDone(true);
      setShowEditBoxes(true);
      logStudySession(); // Log the session when timer ends
      chrome.storage.local.set({ isRunning: false });
    }
  }, [minutes, seconds, isRunning]);

  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [totalMinutesStudied, setTotalMinutesStudied] = useState(0);
  const [activeTab, setActiveTab] = useState("daily"); // open daily tab by default
  const [pastLogs, setPastLogs] = useState([]); // stores past/archived logs
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    chrome.storage.local.get(["pomodoroLogs", "pomodoroPastLogs"], (result) => {
      const current = result.pomodoroLogs || [];
      const past = result.pomodoroPastLogs || [];
      setLogs(current);
      setPastLogs(past);
  
      const totalMinutes = current
        .filter((log) => log.type === "work" && log.durationMinutes)
        .reduce((sum, log) => sum + log.durationMinutes, 0);
      setTotalMinutesStudied(totalMinutes);
    });
  }, [isTimerDone]);
  
  
  const handleStart = () => {
    console.log('Starting timer with:', minutes, 'minutes and', seconds, 'seconds');
  
    chrome.storage.local.set({
      minutes,
      seconds,
      isRunning: true,
      pomodoroStartTime: Date.now(),
      mode: "work" // ✅ mark as work session
    }, () => {
      chrome.runtime.sendMessage({ action: "start" });
    });    
  
    setIsRunning(true);
    setIsTimerDone(false);
    setShowEditBoxes(false);
  };
  

  const handlePause = () => {
    console.log('Pausing timer...');
    chrome.runtime.sendMessage({ action: "pause" });
    setIsRunning(false);
    setShowEditBoxes(true);
  };

  const handleReset = (customMinutes = 25) => {
    console.log('Resetting timer to', customMinutes, 'minutes');
    chrome.runtime.sendMessage({ action: "reset", minutes: customMinutes });
    chrome.storage.local.set({ isRunning: false }, () => {});
    setIsRunning(false);
    setMinutes(customMinutes);
    setSeconds(0);
    setShowEditBoxes(true);
    setIsTimerDone(false);
  };

  const handleShortBreak = () => {
    console.log('Starting short break...');
    handleReset(5);
    chrome.storage.local.set({ mode: "break" });
  };

  const handleLongBreak = () => {
    console.log('Starting long break...');
    handleReset(15);
    chrome.storage.local.set({ mode: "break" });
  };

  const getStartOfWeek = (date) => {
    const day = date.getDay(); // 0 = Sunday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };
  
  const getWeeklySummary = (logs) => {
    const summary = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
  
    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      if (log.type === "work" && log.durationMinutes) {
        summary[dayName] += log.durationMinutes;
      }
    });
  
    return summary;
  };  

  const getDateOfWeekday = (weekday) => {
    const base = getStartOfWeek(new Date()); // Monday of this week
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const index = weekdays.indexOf(weekday);
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const groupLogsByWeek = (logs) => {
    const weekGroups = {};
  
    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      const monday = getStartOfWeek(date).toDateString();
  
      if (!weekGroups[monday]) weekGroups[monday] = [];
      weekGroups[monday].push(log);
    });
  
    return weekGroups;
  };
  
  const formatMinutes = (mins) => `${mins} ${mins === 1 ? "min" : "mins"}`;

  return (
    <>
      <div className="pomodoro-container">
        <h1 className="pomodoro-title">Pomodoro Timer</h1>
  
        {isTimerDone && (
          <span className="timer-done-message">
            Timer is up! Set a new Break/Study Timer!
          </span>
        )}
  
        {showEditBoxes && (
          <div className="input-group">
            <input
              type="number"
              value={minutes}
              onChange={(e) => {
                const newMinutes = Math.max(0, parseInt(e.target.value) || 0);
                console.log("Minutes changed to", newMinutes);
                setMinutes(newMinutes);
              }}
              disabled={isRunning}
              min="0"
            />
            <span>:</span>
            <input
              type="number"
              value={seconds}
              onChange={(e) => {
                const newSeconds = Math.max(
                  0,
                  Math.min(59, parseInt(e.target.value) || 0)
                );
                console.log("Seconds changed to", newSeconds);
                setSeconds(newSeconds);
              }}
              disabled={isRunning}
              min="0"
              max="59"
            />
          </div>
        )}
  
        {/* Mute/unmute volume button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            marginTop: "-12px", // tighter pull-up
            marginBottom: "-6px", // reduce gap under button too
          }}
        >
          <button onClick={() => setIsMuted((prev) => !prev)} className="volume-button">
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
  
        <div className="timer-display">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
  
        <div className="timer-buttons">
          {!isRunning ? (
            <button onClick={handleStart}>Start</button>
          ) : (
            <button onClick={handlePause}>Pause</button>
          )}
          <button onClick={() => handleReset(25)}>Reset</button>
        </div>
  
        <div className="break-options">
          <button onClick={handleShortBreak}>Short Break (5 mins)</button>
          <button onClick={handleLongBreak}>Long Break (15 mins)</button>
        </div>
      </div>
  
{/*  Log Viewer Section - below timer box */}
<div className="mx-auto bg-white rounded shadow-md text-center" style={{ padding: "10px", marginTop: "20px" }}>
  <h3 className="text-xl font-semibold" style={{ marginTop: "10px", marginBottom: "10px" }}>
    Your Study Log
  </h3>
  <div className="tab-switcher">
  <div
    className={`tab ${activeTab === "daily" ? "active-tab" : "inactive-tab"}`}
    onClick={() => setActiveTab("daily")}
  >
    Daily
  </div>
  <div
    className={`tab ${activeTab === "weekly" ? "active-tab" : "inactive-tab"}`}
    onClick={() => setActiveTab("weekly")}
  >
    Weekly
  </div>
</div>
<div className="tab-underline">
  <div
    className="underline-highlight"
    style={{ left: activeTab === "daily" ? "0%" : "50%" }}
  ></div>
</div>

{activeTab === "daily" && (
  <>
    {(() => {
      const today = new Date();
      const todayString = today.toDateString();

      const todaysLogs = logs.filter((log) => {
        const logDate = new Date(log.timestamp).toDateString();
        return logDate === todayString && log.durationMinutes >= 1;
      });

      if (todaysLogs.length === 0) {
        return <p>No study sessions today.</p>;
      }

      const totalMinutes = todaysLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
      const formattedDate = today.toLocaleDateString(undefined, {
        month: "numeric",
        day: "numeric",
        year: "numeric"
      });

      return (
        <>
          <p style={{ marginTop: "1rem", fontWeight: "bold", color: "#444" }}>
            🗓️ {formattedDate} — Total Time Studied: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>

          <ul className="log-list">
            {todaysLogs.map((log, index) => {
              const logTime = new Date(log.timestamp).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
              });
              return (
                <li key={index} style={{ listStyleType: "'• '", paddingLeft: "0.5rem", marginBottom: "0.25rem" }}>
                  {logTime} - Studied for {formatMinutes(log.durationMinutes)}
                </li>
              );
            })}
          </ul>
        </>
      );
    })()}
  </>
)}


{activeTab === "weekly" && (
  <>
    <div className="week-summary-cards">
    {Object.entries(groupLogsByWeek(logs)).map(([weekStartDateStr, weekLogs], idx) => {
  const weekStartDate = new Date(weekStartDateStr);
  const summary = getWeeklySummary(weekLogs);
  const isOpen = expandedWeeks[weekStartDateStr];

  return (
<div
  className="event-dropdown-header"
  onClick={() =>
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekStartDateStr]: !prev[weekStartDateStr]
    }))
  }
  style={{
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", // <-- this allows line wrapping
    gap: "0.5rem"
  }}
>
  <div className="dropdown-title" style={{ fontWeight: "600", fontSize: "1rem", color: "#333" }}>
    {expandedWeeks[weekStartDateStr] ? "▲" : "▼"} Week of{" "}
    {weekStartDate.toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric"
    })}
  </div>

  <div className="duration-chip">
    {formatMinutes(Object.values(summary).reduce((a, b) => a + b, 0))}
  </div>

      {isOpen && (
        <div className="day-body">
          {Object.entries(summary).map(([day, minutes]) => (
            <p key={day} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem", color: "#7c3a5b" }}>•</span>
            <span>
              <strong>{day}:</strong> {minutes > 0 ? formatMinutes(minutes) : "No study"}
            </span>
          </p>
          ))}
        </div>
      )}
    </div>
  );
})}
    </div>
  </>
)}
</div>
    </>
  );
}

const logStudySession = () => {
  chrome.storage.local.get(["pomodoroLogs", "pomodoroStartTime"], (result) => {
    const logs = result.pomodoroLogs || [];
    const startTime = result.pomodoroStartTime;

    const endTime = Date.now();
    const elapsedMs = startTime ? endTime - startTime : 0;
    const elapsedMin = startTime ? Math.round(elapsedMs / 60000) : 0;

    if (elapsedMin < 1) return; // ⛔ Skip logging sessions under 1 minute

    const session = {
      type: "work",
      timestamp: new Date().toISOString(),
      durationMinutes: elapsedMin
    };

    logs.push(session);
    chrome.storage.local.set({ pomodoroLogs: logs });
    console.log("Study session logged:", session);
  });
};

export default PomodoroTimer;
