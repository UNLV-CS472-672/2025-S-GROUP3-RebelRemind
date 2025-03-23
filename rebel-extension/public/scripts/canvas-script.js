/**
 * Script for Handling Canvas API Requests Chrome Extension
 *
 * This script contains a function for fetching assignments for a particular class and for fetching the list of courses a student is currently enrolled in from Canvas API.
 * It does not contain event listeners, as they are managed in background.js.
 *
 * Authored by: Gunnar Dalton
 */


/**
 * Gets a list of assignments from the Canvas API for the specified course and outputs to the console.
 */
async function getAssignments(courseID) {
    let url = `https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&per_page=100&context_codes[]=course_${courseID}`; // URL for Canvas API call.
    const accessToken = await getCanvasPAT(); // Get Canvas Access Token from chrome.storage.
    let allAssignments = []; // Stores all assignments found in a particular course.

    try {
        while(url) { // Loops through pages of Canvas data.
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
            // ai-get start (ChatGPT-4o, 0)
            const assignments = await response.json(); // Collect response of assignments
            allAssignments = allAssignments.concat(assignments); // Add response to current list
            
            // Handle Pagination - Check for 'next' page in Link header
            const linkHeader = response.headers.get("Link");
            url = null; // Default to no next page
            
            if (linkHeader) {
                const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                if (match) {
                    url = match[1]; // Extract next page URL
                }
            }
            // ai-gen end
        }
        console.log("Assignments:", allAssignments); // Send results to console for viewing.

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
            if (data.canvasPAT) { // Canvas Access Token found in storage.
                resolve(data.canvasPAT);
            } else { // No Canvas Access Token found in storage.
                resolve(false);
            }
        });
    });
}
// ai-gen end

/**
 * Gets a list of courses from the Canvas API and calls getAssignments() on the course.
 */
export async function getCourses() {
    let url = `https://unlv.instructure.com/api/v1/courses?per_page=100`;
    const accessToken = await getCanvasPAT(); // Get Canvas Access Token from chrome.storage.
    if (!accessToken) { // No Canvas Access Token found.
        console.log("Please store an access token!");
        return;
    }
    let allCourses = []; // Stores all courses student has been enrolled in.
    let activeCourses = []; // Stores only courses student is currently enrolled in.

    try {
        while (url) { // Loops through pages Canvas data.
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

            // ai-get start (ChatGPT-4o, 0)
            const courses = await response.json(); // Collect response of courses
            allCourses = allCourses.concat(courses); // Add response to current list

            // Handle Pagination - Check for 'next' page in Link header
            const linkHeader = response.headers.get("Link");
            url = null; // Default to no next page

            if (linkHeader) {
                const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                if (match) {
                    url = match[1]; // Extract next page URL
                }
            }
            // ai-gen end
        }

        for(const course of allCourses) {
            if(!course.access_restricted_by_date) { // Finds courses that student is actively enrolled in.
                activeCourses.push(course.id);
            }
        }
        for (const course of activeCourses) { // Get assignments for all active courses.
            getAssignments(course);
        }

    } catch (error) {
        console.error("Error fetching events:", error);
    }
}