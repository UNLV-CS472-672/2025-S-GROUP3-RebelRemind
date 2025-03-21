// background.js
export function weeklyReminders(message, sendResponse) {
  const assignments = message.assignments;

  if (!Array.isArray(assignments)) {
    console.error("Expected assignments to be an array, got:", assignments);
    sendResponse({});
    return;
  }

  //ai chatGpt 4o start
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday
  //chatGpt end

  const result = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  for (const a of assignments) {
    console.log(a);
    const date = new Date(a.assignment.due_at);
    if (date >= weekStart && date <= weekEnd) {
      //ai chatGpt 4o start
      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      result[day]?.push(a.tile, a.assignment.due_at); //added tuple of name date
      //chatGpt end
    }
  }

  sendResponse(result);
  return true; // Required for async response
}
