/**
 * Script for Handling Canvas API Requests Chrome Extension
 *
 * This script contains a function for fetching assignments for a particular class and for fetching the list of courses a student is currently enrolled in from Canvas API.
 * It does not contain event listeners, as they are managed in background.js.
 *
 * Authored by: Gunnar Dalton
 */


/**
 * Gets a list of assignments from the Canvas API for the specified course and outputs in a useful format.
 */
export async function getAssignments(courseID, accessToken) {
    let url = `https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&per_page=100&context_codes[]=course_${courseID}`; // URL for Canvas API call.
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
            // ai-gen start (ChatGPT-4o, 0)
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
        // ai-gen (ChatGPT-4o, 2)
        const selectedKeys = ["title", "context_name"];
        const nestedKeys = ["due_at"];

        const calendarFormattedAssignments = allAssignments.map(assignment => {
            const filteredMain = Object.fromEntries(
                Object.entries(assignment).filter(([key]) => selectedKeys.includes(key))
            );
            const filteredNested = Object.fromEntries(
                Object.entries(assignment.assignment).filter(([key]) => nestedKeys.includes(key))
            );
            return { ...filteredMain, ...filteredNested};
        });
        // ai-gen end
        return calendarFormattedAssignments;

    } catch (error) {
        console.error("Error fetching events:", error);
    }
}

/**
 * Gets the Canvas Access Token from chrome.storage for use in other functions.
 */
// ai-gen start (ChatGPT-4o, 2)
export function getCanvasPAT() {
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
 * Gets a list of courses from the Canvas API to use in getAssignments().
 */
export async function getCourses(accessToken) {
    let url = `https://unlv.instructure.com/api/v1/courses?per_page=100`;
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
                if (response.status == 401) {
                    console.log("There may be an issue with your Canvas Access Token. Please check that and try again!");
                }
                throw new Error(`HTTP Error: ${response.status}`);
            }

            // ai-gen start (ChatGPT-4o, 0)
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
        return activeCourses;

    } catch (error) {
        console.error("Error fetching events:", error);
        return false;
    }
}