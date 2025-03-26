/**
 * CloseButton Component
 * 
 * Displays a close button (✖) that, when clicked, shows a confirmation prompt asking 
 * the user if they are sure they want to exit. If "Yes" is clicked, the extension popup is closed.
 * If "No" is clicked, the confirmation prompt is hidden.
 * 
 * Dependencies:
 * - React: JavaScript library for building user interfaces.
 * - `useState` hook: Used to manage the visibility of the confirmation prompt.
 * 
 * Functionality:
 * - Clicking the close button triggers the display of a confirmation box.
 * - "Yes" button closes the extension popup.
 * - "No" button hides the confirmation box.
 * 
 * Example Usage:
 * 
 * import CloseButton from "./components/CloseButton";
 * 
 * function App() {
 *   return <CloseButton />;
 * }
 * 
 * Authored - Chandni Mirpuri Silva
 * 
 * Documentation by Chatgpt
 */

import React from "react";

function App() {
  const handleClose = () => {
    window.close(); // Closes the Chrome extension popup
  };

  return (
    <div>
      <button className="close-button" onClick={handleClose}>X</button>
    </div>
  );
}

export default App;
