import { useEffect, useState } from "react";

/**
 * CanvasAssignments Component
 * 
 * This displays the list of assignments from Canvas for the Upcoming Assignments on the accordion menu.
 * Assignments are sorted in due date order and only upcoming assignments are displayed.
 * 
 * Authored by: Gunnar Dalton
 */

function CanvasAssignments() {
    const [assignments, setAssignments] = useState([]);

    /**
     * Effect Hook: Load the Canvas Assignments and format them when the component mounts.
     */
    useEffect(() => {
        /**
        * Fetches Canvas assignments from storage, selects upcoming assignments, and sorts them in due date order.
        */
        const fetchAssignments = async () => {
            chrome.storage.local.get("Canvas_Assignments", (data) => {
                if (data.Canvas_Assignments) { 
                    // ai-gen start (ChatGPT-4o, 1)
                    const assignmentList = data.Canvas_Assignments;
                    const upcomingAssignments = assignmentList.filter((a) => { // filter out past due assignments or ones without a due date
                        return a.due_at && new Date(a.due_at) >= new Date();
                    });

                    upcomingAssignments.sort((a, b) => new Date(a.due_at) - new Date(b.due_at)); // sort dates in order
                    // ai-gen end

                    setAssignments(upcomingAssignments);
                } else { 
                    setAssignments([]);
                }
            });
		};
		fetchAssignments();

        /**
 		* Listens for messages indicating that the assignment list has been updated.
 		*/
        const handleMessage = (message, sender, sendResponse) => {
            if (message.type === "UPDATE_ASSIGNMENTS") {
                fetchAssignments();
                sendResponse(true);
                return true;
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    if (assignments.length === 0) {
        return <p>No assignments found.</p>;
      }

    return (
        <div>
            <ul>
                {/* ai-gen start (ChatGPT-4o, 1) */}
                {assignments.map((assignment, index) => (
                    <li key={index}>
                    <span className="font-semibold">{assignment.context_name}</span>:{" "}
                    {assignment.title}
                    {getDueDateLabel(assignment.due_at)}
                    </li>
                ))}
                {/* ai-gen end */}
            </ul>
        </div>
    );
}

export default CanvasAssignments;

/**
 * Processes the specified due date to determine if it is today or tomorrow or neither and returns the proper string to be displayed.
 */
// ai-gen start (ChatGPT-4o, 1)
function getDueDateLabel(dueDate) {
    const due_at = new Date(dueDate); // hold actual due date
    const today = new Date(); // date of today
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1); // date of tomorrow

    today.setHours(0, 0, 0, 0); // make all hours the same so only day is checked
    tomorrow.setHours(0, 0, 0, 0);
    const dueDay = new Date(due_at); // make new copy to modify for due date
    dueDay.setHours(0, 0, 0, 0);

    const timeString = due_at.toLocaleTimeString(undefined, { // generate time only string
        hour: "numeric",
        minute: "2-digit",
    });

    if (dueDay.getTime() === today.getTime()) { // assignment is due today
        return ` due at ${timeString} today`;
    }
    else if (dueDay.getTime() === tomorrow.getTime()) { // assignment is due tomorrow
        return ` due at ${timeString} tomorrow`;
    }
    else { // assignment is due after tomorrow
        const dateString = due_at.toLocaleDateString(undefined, { // generate day only string
            month: "long",
            day: "numeric"
        });
        return ` due on ${dateString} at ${timeString}`;
    }
}
// ai-gen end