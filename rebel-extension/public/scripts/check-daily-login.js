/**
 * checkDailyTask
 * ---------------------
 * Checks whether the daily task has already been executed for the current day.
 * 
 * This function retrieves the last run date from Chrome's local storage and compares it
 * to today's date (in 'YYYY-MM-DD' format using the 'en-CA' locale). If the stored date 
 * does not match today, it updates the date in storage and resolves `true`, indicating 
 * that the task should proceed. If it matches, it resolves `false` to skip execution.
 * 
 * Intended to be used in Chrome Extensions to ensure daily logic only runs once per day.
 *
 * @author Billy Estrada
 * @returns {Promise<boolean>} - Resolves `true` if the task should run, `false` otherwise.
 */

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
