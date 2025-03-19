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
    const courseID = await getCourseID();
    if (!courseID) {
        console.log("Please store a course ID!");
        return;
    }
    const url = `https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&context_codes[]=course_${courseID}`;
    const accessToken = await getCanvasPAT();
    if (!accessToken) {
        console.log("Please store an access token!");
        return;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const assignments = await response.json();
        console.log("Assignments:", assignments);
    } catch (error) {
        console.error("Error fetching events:", error);
    }
}

// ai-get start
function getCanvasPAT() {
    return new Promise((resolve) => {
        chrome.storage.local.get("canvasPAT", (data) => {
            if (data.canvasPAT) {
                resolve(data.canvasPAT);
            } else {
                resolve(false);
            }
        });
    });
}
// ai-gen end

function getCourseID() {
    return new Promise((resolve) => {
        chrome.storage.local.get("courseID", (data) => {
            if (data.courseID) {
                resolve(data.courseID);
            }
            else {
                resolve(false);
            }
        });
    });
}