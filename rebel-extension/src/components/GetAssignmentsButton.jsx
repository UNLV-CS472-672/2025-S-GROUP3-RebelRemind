import { useState } from "react";

/**
 * GetAssignmentsButton Component
 *
 * This component handles the fetching of assignments from Canvas by sending a message 
 * to the background script to trigger the fetch.
 *
 * Authored by: Gunnar Dalton
 *
 * @returns {JSX.Element} The GetAssignmentsButton component UI.
 */
const GetAssignmentsButton = () => {
  /**
   * Initiates the Canvas assignment fetching.
   */
  const fetchAssignments = () => {
    new Promise ((resolve) => { // Check preferences to ensure Canvas integration is enabled.
      chrome.runtime.sendMessage({ type: "GET_PREFERENCES" }, (response) => {
          if (response && response.preferences) {
              const canvasIntegrationPreference = response.preferences.canvasIntegration;
              if (canvasIntegrationPreference) {
                  resolve(canvasIntegrationPreference);
              }
              else {
                  alert("Canvas Integration is disabled!")
                  resolve(canvasIntegrationPreference);
              }
          } else { // No preferences stored in storage.
              alert("No preferences set!");
              resolve(false);
          }
      });
    }).then((canvasIntegrationPreference) => {
      if(canvasIntegrationPreference) { // Go ahead with GET_SCHEDULE since Canvas integration is enabled.
          chrome.runtime.sendMessage({ type: "GET_SCHEDULE" }, (response) => {
              if (response) {
                alert("Your schedule has been fetched!");
              }
              else {
                alert("No schedule found!");
              }
          });
      }
    });
  };

  return (
    <div>
      <button onClick={fetchAssignments}>Get Your Canvas Assignments</button>
    </div>
  );
};

export default GetAssignmentsButton;
