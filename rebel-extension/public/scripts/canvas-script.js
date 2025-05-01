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
                const fetchStatus = { success: false, error: response.status };
                chrome.storage.local.set({ CanvasFetchStatus: fetchStatus }); // pass error to storage
                chrome.storage.local.set({ Canvas_Assignments: [] }); // empty assignment storage
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
        // ai-gen start (ChatGPT-4o, 2)
        const selectedKeys = ["title", "context_name", "html_url"];
        const nestedKeys = ["due_at", "id", "user_submitted", "course_id"];

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
        console.log("Error fetching assignments:", error); // error is logged instead of sending error to Chrome
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
    let activeCoursesIDs = []; // Stores only course IDs of courses student is currently enrolled in.

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
                    const fetchStatus = { success: false, error: "Invalid Canvas Access Token" };
                    chrome.storage.local.set({ CanvasFetchStatus: fetchStatus }); // pass error to storage
                    chrome.storage.local.set({ Canvas_Assignments: [] }); // empty assignment storage
                }
                else {
                    const fetchStatus = { success: false, error: response.status };
                    chrome.storage.local.set({ CanvasFetchStatus: fetchStatus });
                    chrome.storage.local.set({ Canvas_Assignments: [] });
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
                activeCoursesIDs.push(course.id);
            }
        }
        
        chrome.storage.local.get("colorList", (data) => {
            let colorList = data.colorList;
            let courseColorList = colorList.CanvasCourses;
            for(const course of allCourses) {
                if(!course.access_restricted_by_date) { // Finds courses that student is actively enrolled in.
                    if(!courseColorList[course.id]) {
                        courseColorList[course.id] = { color: generateInitialColor(course.id), name: course.name };
                    }
                }
            }
            colorList.CanvasCourses = courseColorList;
            chrome.storage.local.set({ colorList: colorList });
        });
        return activeCoursesIDs;

    } catch (error) {
        console.log("Error fetching courses:", error);
        return false;
    }
}

/**
 * Create an initial color for each Canvas course based on the ID
 */
// ai-gen start (ChatGPT-4o, 0)
export function generateInitialColor(courseID) {
    let hash = 0;
    const idString = courseID.toString();
    for (let i = 0; i < idString.length; i++) {
        hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    let s = 70;
    let l = 60;
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x  = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (120 <= h && h < 180) {
        r = 0; 
        g = c; 
        b = x;
    }
    else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0; 
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
// ai-gen end