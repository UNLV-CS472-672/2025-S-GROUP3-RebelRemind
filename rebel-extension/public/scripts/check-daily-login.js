export function checkDailyTask() {
  const today = new Date().toLocaleDateString('en-CA')

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
