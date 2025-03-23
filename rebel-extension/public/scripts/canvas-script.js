/**
 * Script for Handling Canvas API Requests Chrome Extension
 *
 * This script contains a function for fetching assignments from the Canvas API.
 * It does not contain event listeners, as they are managed in background.js.
 *
 * Authored by: Gunnar Dalton
 */

/**
 * Gets a list of assignments from the Canvas API for the specified course and outputs to the console.
 */
export async function getAssignments() {
  const courseID = await getCourseID(); // Get course ID from chrome.storage.
  if (!courseID) {
    // No course ID found.
    console.log("Please store a course ID!");
    return;
  }
  const url = `https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&context_codes[]=course_${courseID}`; // URL for Canvas API call.
  const accessToken = await getCanvasPAT(); // Get Canvas Access Token from chrome.storage.
  if (!accessToken) {
    // No Canvas Access Token found.
    console.log("Please store an access token!");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const assignments = await response.json();
    console.log("Assignments:", assignments); // Send results to console for viewing.
    return assignments;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

/**
 * Gets the Canvas Access Token from chrome.storage for use in getAssignments().
 */
// ai-get start (ChatGPT-4o, 2)
function getCanvasPAT() {
  return new Promise((resolve) => {
    chrome.storage.local.get("canvasPAT", (data) => {
      if (data.canvasPAT) {
        // Canvas Access Token found in storage.
        resolve(data.canvasPAT);
      } else {
        // No Canvas Access Token found in storage.
        resolve(false);
      }
    });
  });
}
// ai-gen end

/**
 * Gets the course ID from chrome.storage for use in getAssignments().
 */
function getCourseID() {
  return new Promise((resolve) => {
    chrome.storage.local.get("courseID", (data) => {
      if (data.courseID) {
        // Course ID found in storage.
        resolve(data.courseID);
      } else {
        // No course ID found in storage.
        resolve(false);
      }
    });
  });
}
