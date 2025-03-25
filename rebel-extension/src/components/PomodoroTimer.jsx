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
import FinishAlarm from "../components/FinishAlarm.mp3"; // Ensure the path is correct

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25); // Default 25 minutes
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const alarmRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    console.log("Initializing audio...");
    alarmRef.current = new Audio(FinishAlarm);
    alarmRef.current.load(); // Preload the audio
    alarmRef.current.oncanplaythrough = () => {
      console.log("Audio loaded successfully");
    };
    alarmRef.current.onerror = (error) => {
      console.error("Error loading audio:", error);
    };

    return () => {
      alarmRef.current = null; // Cleanup on unmount
    };
  }, []);

  // Start Timer Logic
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        console.log(`Timer running: ${minutes}:${seconds}`);

        if (minutes === 0 && seconds === 0) {
          console.log("Timer reached 00:00");
          setIsRunning(false); // Stop the timer when reaching 00:00

          // Directly play the sound when the timer hits 00:00
          alarmRef.current.play().then(() => {
            console.log("Alarm played successfully");
          }).catch((error) => {
            console.error("Error playing alarm:", error);
          });
        } else {
          if (seconds === 0) {
            setMinutes((prev) => prev - 1); // Decrease minute
            setSeconds(59); // Reset seconds to 59
          } else {
            setSeconds((prev) => prev - 1); // Decrease seconds
          }
        }
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds]); // Effect re-runs when state changes

  const handleStart = () => {
    if (minutes > 0 || seconds > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(25); // Reset minutes to default Pomodoro time
    setSeconds(0); // Reset seconds
  };

  const handleShortBreak = () => {
    setIsRunning(false); // Stop the current timer if running
    setMinutes(5); // Set timer for short break
    setSeconds(0);
  };

  const handleLongBreak = () => {
    setIsRunning(false); // Stop the current timer if running
    setMinutes(15); // Set timer for long break
    setSeconds(0);
  };

  return (
    <div className="pomodoro-container">
      <h3>Pomodoro Timer</h3>

      {/* User Input for Minutes & Seconds */}
      <div className="input-group">
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
          disabled={isRunning}
          min="0"
        />
        <span>:</span>
        <input
          type="number"
          value={seconds}
          onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
          disabled={isRunning}
          min="0"
          max="59"
        />
      </div>

      {/* Timer Display */}
      <div className="timer-display">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>

      {/* Timer Controls */}
      <div className="timer-buttons">
        {!isRunning ? (
          <button onClick={handleStart}>Start</button>
        ) : (
          <button onClick={handlePause}>Pause</button>
        )}
        <button onClick={handleReset}>Reset</button>
      </div>

      {/* Break Options */}
      <div className="break-options">
        <button onClick={handleShortBreak}>Short Break (5 mins)</button>
        <button onClick={handleLongBreak}>Long Break (15 mins)</button>
      </div>
    </div>
  );
}

export default PomodoroTimer;
