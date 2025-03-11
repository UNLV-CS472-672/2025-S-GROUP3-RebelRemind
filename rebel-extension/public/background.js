/**
 * Background Script for Chrome Extension
 *
 * This script initializes the Chrome extension, loads necessary background scripts,
 * and listens for installation events.
 *
 * - Loads `counter-script.js` (handles count-related messaging).
 * - Loads `identity-script.js` (handles Google authentication).
 * - Listens for the `onInstalled` event to notify when the extension is installed.
 */

// Import background scripts
import "./scripts/counter-script.js";
import "./scripts/identity-script.js";

/**
 * Listens for the Chrome extension installation event.
 * This runs once when the extension is first installed or updated.
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});
