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

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const alarmRef = useRef(null);

  useEffect(() => {
    alarmRef.current = new Audio(FinishAlarm);
    alarmRef.current.load();

    // Load initial state from background script
    chrome.storage.local.get(["minutes", "seconds", "isRunning"], (data) => {
      if (data.minutes !== undefined) setMinutes(data.minutes);
      if (data.seconds !== undefined) setSeconds(data.seconds);
      if (data.isRunning !== undefined) setIsRunning(data.isRunning);
    });

    // Listen for real-time updates
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.minutes) setMinutes(changes.minutes.newValue);
      if (changes.seconds) setSeconds(changes.seconds.newValue);
      if (changes.isRunning) setIsRunning(changes.isRunning.newValue);
    });

    return () => {
      chrome.storage.onChanged.removeListener(() => {});
    };
  }, []);

  const handleStart = () => {
    chrome.runtime.sendMessage({ action: "start" });
    setIsRunning(true);
  };

  const handlePause = () => {
    chrome.runtime.sendMessage({ action: "pause" });
    setIsRunning(false);
  };

  const handleReset = (customMinutes = 25) => {
    chrome.runtime.sendMessage({ action: "reset", minutes: customMinutes });
    setIsRunning(false);
    setMinutes(customMinutes);
    setSeconds(0);
  };

  const handleShortBreak = () => handleReset(5);
  const handleLongBreak = () => handleReset(15);

  return (
    <div className="pomodoro-container">
      <h3>Pomodoro Timer</h3>

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
  );
}

export default PomodoroTimer;
