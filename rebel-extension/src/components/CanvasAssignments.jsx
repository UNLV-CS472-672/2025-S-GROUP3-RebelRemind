import { useEffect, useState } from "react";
import { Check, Undo2 } from "lucide-react";
import GroupByWeek from './groupByWeek';

/**
 * CanvasAssignments Component
 * 
 * This displays the list of assignments from Canvas for the Upcoming Assignments on the accordion menu.
 * Assignments are sorted in due date order and only upcoming assignments are displayed.
 * 
 * Authored by: Gunnar Dalton
 */

function CanvasAssignments({ viewMode }) {
    const [assignments, setAssignments] = useState([]);
    const [completedAssignments, setCompletedAssignments] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [justCompleted, setJustCompleted] = useState([]);
    const [CanvasIntegrationPreference, setCanvasIntegrationPreference] = useState(false);
    const [validToken, setValidToken] = useState(false);
    const [CanvasFetchStatus, setCanvasFetchStatus] = useState(false);
    const [CanvasFetchError, setCanvasFetchError] = useState("");

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
                    const assignmentList = data.Canvas_Assignments;
                    const now = new Date();
                    const end = new Date();
                    
                    if (viewMode === "weekly") {
                      end.setDate(now.getDate() + 7);
                    } else {
                      end.setDate(now.getDate() + 1);
                    }
                    
                    const upcomingAssignments = assignmentList.filter((a) => {
                      const dueDate = new Date(a.due_at);
                      return a.due_at && dueDate >= now && dueDate < end;
                    });
                    

                    upcomingAssignments.sort((a, b) => new Date(a.due_at) - new Date(b.due_at)); // sort dates in order

                    let completed = data.completedAssignments || []; // get completed assignments if there is any, if not an empty array
                    completed = completed.filter(item => new Date(item.due_at) > now); // delete any old completed assignments
                    upcomingAssignments.forEach((assignment) =>  { // check Canvas submission status of assignments
                        const alreadyCompleted = completed.some(item => item.id === assignment.id);
                        const isSubmitted = assignment.user_submitted;
                        if (isSubmitted && !alreadyCompleted) {
                            completed.push({ id: assignment.id, due_at: assignment.due_at }); // add to completed list
                        }
                    });
                    chrome.storage.local.set({ completedAssignments: completed}); // store new list into storage

                    setAssignments(upcomingAssignments);
                    setCompletedAssignments(completed);
                } else { 
                    setAssignments([]);
                }
            });
		};

        /**
        * Check that Canvas integration is enabled and there is a Canvas Access Token in storage.
        */
        const checkPreferencesAndToken = async() => {
            chrome.storage.sync.get("preferences", (data) => {
                if (data.preferences.canvasIntegration) {
                    setCanvasIntegrationPreference(true);
                }
            });
            chrome.storage.local.get("canvasPAT", (data) => {
                if (data.canvasPAT) {
                    setValidToken(true);
                }
            });
        };

        /**
        * Check for any errors fetching from Canvas so they can be displayed to user.
        */
        const checkFetchStatus = async() => {
            chrome.storage.local.get("CanvasFetchStatus", (data) => {
                if (!data.CanvasFetchStatus.success) {
                    setCanvasFetchStatus(false);
                    setCanvasFetchError(data.CanvasFetchStatus.error);
                }
                else {
                    setCanvasFetchStatus(true);
                    setCanvasFetchError("");
                }
            });
        }

        checkFetchStatus();
        checkPreferencesAndToken();
		fetchAssignments();

        /**
 		* Listens for messages indicating that the assignment list has been updated.
 		*/
        const handleMessage = (message, sender, sendResponse) => { // call to update from background
            if (message.type === "UPDATE_ASSIGNMENTS") {
                checkFetchStatus();
                fetchAssignments();
                sendResponse(true);
                return true;
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, [viewMode]);

    /**
     * Effect Hook: Resets justCompleted when showCompleted is toggled off
     */
    useEffect(() => {
        if (!showCompleted) {
            setJustCompleted([]);
        }
    }, [showCompleted]);

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
    const assignmentsToDisplay = [...assignments]
        .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
        .filter(a => showCompleted || !isComplete(a.id) || justCompleted.includes(a.id));
        const hasAssignments = assignments.length > 0;
        const hasVisibleAssignments = assignmentsToDisplay.length > 0;

        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + (viewMode === "weekly" ? 7 : 1));

        const visibleCompletedAssignments = completedAssignments.filter(item => {
        const dueDate = new Date(item.due_at);
        return dueDate >= now && dueDate < end;
        });

        const hasCompletedAssignments = visibleCompletedAssignments.length > 0;


    if (!CanvasIntegrationPreference) { // Canvas integration is disabled
        return <p>Canvas integration is disabled! Please check your preferences to enable this feature.</p>
    }

    if (CanvasIntegrationPreference && !validToken) { // Canvas integration is enabled but no token is in storage
        return <p>You do not have a Canvas Access Token stored! Please save a token into storage to enable this feature.</p>
    }

    if (!CanvasFetchStatus) { // There was an error fetching assignments from Canvas
        if (CanvasFetchError === "Invalid Canvas Access Token") { // HTTP 401 error
            return <p>Your Canvas Access Token is invalid! Please check your saved token and try again.</p>
        }
        else { // All other error cases
            return <p>An error occured while fetching your assignments! Please check your saved token or try again later.</p>
        }
    }

    if (!hasVisibleAssignments && !showCompleted) {
        const message = hasAssignments
          ? (viewMode === "daily"
              ? "All assignments due today are completed! 🎉"
              : "All assignments due this week are completed! 🎉")
          : (viewMode === "daily"
              ? "No assignments due today."
              : "No assignments due this week.");
      
        return (
          <div>
            <p>{message}</p>
            {hasCompletedAssignments && (
              <div className="mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={() => setShowCompleted(!showCompleted)}
                  />
                  <span>{showCompleted ? 'Hide Completed' : 'Show Completed'}</span>
                </label>
              </div>
            )}
          </div>
        );
      }
      
      
      

    const groupedAssignments = {};
    assignmentsToDisplay.forEach((assignment) => {
        const date = new Date(assignment.due_at);
        const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
        if (!groupedAssignments[weekday]) groupedAssignments[weekday] = [];
        groupedAssignments[weekday].push({
            ...assignment,
            label: isComplete(assignment.id)
                ? getDueDateLabel(assignment.due_at)
                : formatDueDateLabel(getDueDateLabel(assignment.due_at)),
            link: assignment.html_url
        });
    });

    return (
        <div>
        <GroupByWeek
            groupedItems={groupedAssignments}
            isComplete={isComplete}
            markComplete={markComplete}
            undoComplete={undoComplete}
            isCanvas={true}
            showCompleted={showCompleted}
            setShowCompleted={setShowCompleted}
            allCompleted={!hasVisibleAssignments && hasAssignments}
            hasCompletedAssignments={hasCompletedAssignments}
        />

            <div className="mt-2">
                {/* Show Completed checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={() => setShowCompleted(!showCompleted)}
                    />
                    <span>{showCompleted ? 'Hide Completed' : 'Show Completed'}</span>
                </label>
            </div>
        </div>
    );
}

export default CanvasAssignments;

/**
 * Processes the specified due date to determine if it is today or tomorrow or neither and returns the proper string to be displayed.
 */
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
