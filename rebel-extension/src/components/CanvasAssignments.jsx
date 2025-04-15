import { useEffect, useState } from "react";
import { Check, Undo2 } from "lucide-react";

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
    const [completedAssignments, setCompletedAssignments] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [justCompleted, setJustCompleted] = useState([]);

    /**
     * Effect Hook: Load the Canvas Assignments and format them when the component mounts.
     */
    useEffect(() => {
        /**
        * Fetches Canvas assignments from storage, selects upcoming assignments, and sorts them in due date order.
        */
        const fetchAssignments = async () => {
            chrome.storage.local.get(["Canvas_Assignments", "completedAssignments"], (data) => {
                if (data.Canvas_Assignments) { 
                    // ai-gen start (ChatGPT-4o, 1)
                    const assignmentList = data.Canvas_Assignments;
                    const upcomingAssignments = assignmentList.filter((a) => { // filter out past due assignments or ones without a due date
                        return a.due_at && new Date(a.due_at) >= new Date();
                    });

                    upcomingAssignments.sort((a, b) => new Date(a.due_at) - new Date(b.due_at)); // sort dates in order
                    
                    let completed = data.completedAssignments || []; // get completed assignments if there is any, if not an empty array
                    const now = new Date();
                    completed = completed.filter(item => new Date(item.due_at) > now); // delete any old completed assignments
                    upcomingAssignments.forEach((assignment) =>  { // check Canvas submission status of assignments
                        const alreadyCompleted = completed.some(item => item.id === assignment.id);
                        const isSubmitted = assignment.user_submitted;
                        if (isSubmitted && !alreadyCompleted) {
                            completed.push({ id: assignment.id, due_at: assignment.due_at }); // add to completed list
                        }
                    })
                    chrome.storage.local.set({ completedAssignments: completed}); // store new list into storage
                    // ai-gen end

                    setAssignments(upcomingAssignments);
                    setCompletedAssignments(completed);
                } else { 
                    setAssignments([]);
                }
            });
		};
		fetchAssignments();

        /**
 		* Listens for messages indicating that the assignment list has been updated.
 		*/
        const handleMessage = (message, sender, sendResponse) => { // call to update from background
            if (message.type === "UPDATE_ASSIGNMENTS") {
                fetchAssignments();
                sendResponse(true);
                return true;
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    /**
    * Checks the completed assignments list for a given assignment id. Returns true if assignment is complete.
    */
    const isComplete = (id) => completedAssignments.some(item => item.id === id); 

    /**
    * Handles marking an assignment complete in the accordion menu.
    */
    const markComplete = (assignment) => { 
        const completed = [...completedAssignments, { id: assignment.id, due_at: assignment.due_at }];
        setCompletedAssignments(completed);
        setJustCompleted([...justCompleted, assignment.id]);
        chrome.storage.local.set({ completedAssignments: completed });
    }

    /**
    * Handles unmarking an assignment as complete when undo is clicked in the accordion menu.
    */
    const undoComplete = (id) => { 
        const completed = completedAssignments.filter(item => item.id !== id);
        setCompletedAssignments(completed);
        chrome.storage.local.set({ completedAssignments: completed });
    }

    /**
    * Lists all assignments that should be displayed in the accordion menu based on the current showCompleted state.
    */
    // ai-gen start (ChatGPT-4o, 0)
    const assignmentsToDisplay = [...assignments]
        .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
        .filter(a => showCompleted || !isComplete(a.id) || justCompleted.includes(a.id));
    // ai-gen end

    if (assignments.length === 0) {
        return <p>No assignments found.</p>;
      }

    return (
        // ai-gen start (ChatGPT-4o, 2)
        <div>
            <ul className="m-0 p-0">
                {assignmentsToDisplay.map((assignment) => (
                    <li
                        key={assignment.id}
                        className="flex justify-between items-start gap-2 w-full p-2 relative pl-0"
                        style={{ display: "flex" }}
                    >
                        {/* Display assignment item */}
                        <span className="absolute left-0 top-2 text-xl">•</span> 
                        <div
                            className="break-words"
                            style={{ width: "312px", flexShrink: 0, flexGrow: 0, 
                                color: isComplete(assignment.id) ? "gray" : "inherit", 
                                textDecoration: isComplete(assignment.id) ? "line-through" : "none" }}
                        >
                            <span style={{ fontWeight: "bold" }}>{assignment.context_name}</span>:{" "}
                            {assignment.title} {isComplete(assignment.id) ? getDueDateLabel(assignment.due_at): formatDueDateLabel(getDueDateLabel(assignment.due_at))}
                        </div>
                        { isComplete(assignment.id) ? (
                            // Assignment is complete
                            <button
                                onClick={() => undoComplete(assignment.id)}
                                className="rounded flex items-center justify-center"
                                style={{ alignSelf: "center", height: "fit-content", padding: "0px 2px 3px 2px" }}
                                title="Undo Complete"
                            >
                                <Undo2 size={18} strokeWidth={2.5} />
                            </button>
                        ) : (
                            // Assignment is not complete
                            <button
                            onClick={() => markComplete(assignment)}
                            className="rounded flex items-center justify-center"
                            style={{ alignSelf: "center", height: "fit-content", padding: "0px 2px 3px 2px" }}
                            title="Assignment Completed"
                            >
                                <Check size={18} strokeWidth={2.5} />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <div className="mt-2">
                {/* Show completed checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={() => setShowCompleted(!showCompleted)}
                    />
                    <span> Show Completed</span>
                </label>
            </div>
        </div>
        // ai-gen end
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

/**
* Formats the date string with the correct bolded words to emphasize the date and time the assignment is due
*/
const formatDueDateLabel = (label) => {
    const parts = label.split(" ");
    return parts.map((word, index) => {
        if ([ "due", "at", "on"].includes(word)) { // exclude these words from being bolded
            return <span key={index}> {word} </span>;
        }
        else {
            return (<span key={index} style={{ fontWeight: "bold" }}>
                {" "} {word} </span>);
        }
    });
}
// ai-gen end