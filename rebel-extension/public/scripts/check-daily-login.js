export function checkDailyTask() {
  const today = new Date().toISOString().split("T")[0];

  return new Promise((resolve) => {
    chrome.storage.local.get(["lastRunDate"], (result) => {
      const lastRun = result.lastRunDate;

      if (lastRun !== today) {
        chrome.storage.local.set({ lastRunDate: today }, () => {
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  });
}
