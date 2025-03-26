import { useEffect, useState, useRef } from "react";

/**
 * Side Panel Button Component - Opens Rebel Remind side panel
 * Uses Chrome Messaging API to communicate with the background script.
 *
 * Features:
 * - Opens a different component of the chrome extension
 *
 * Authored by: Billy Estrada
 *
 * Put into component SidePanelButton.jsx by: Billy Estrada
 *
 * @returns {JSX.Element} The SidePanelButton component UI.
 */
function SidePanelButton() {
  const handleOpenSidePanel = () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" });
    window.close();
  };

  return (
    <div>
      <button onClick={handleOpenSidePanel}>
        Calendar View --&gt;
      </button>
    </div>
  );
}

export default SidePanelButton;
