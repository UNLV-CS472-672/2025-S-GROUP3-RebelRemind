export function checkDailyTask() {
  const today = new Date().toISOString().split("T")[0];
  chrome.storage.local.get(["lastRunDate"], (result) => {
    const lastRun = result.lastRunDate;

    if (lastRun != today) {
      chrome.storage.local.set({ lastRunDate: today });
      return true;
    }
    return false;
  });
}
