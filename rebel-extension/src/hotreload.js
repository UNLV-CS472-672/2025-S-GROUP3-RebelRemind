/**
 * Hot-Reloading Script for Chrome Extension Development
 *
 * This script enables automatic reloading of the Chrome extension during development.
 * - It detects file changes inside the extension directory.
 * - If any files are modified, the script triggers `chrome.runtime.reload()`.
 * - This eliminates the need for manual reloading via `chrome://extensions/`.
 *
 * How It Works:
 * - It recursively scans the extension's directory for file modifications.
 * - It checks file timestamps every second.
 * - If a change is detected, it reloads the extension automatically.
 *
 * Note: This script only runs in **development mode**.
 */

/**
 * Recursively retrieves all files in a given directory.
 *
 * @param {DirectoryEntry} dir - The directory to scan for files.
 * @returns {Promise<File[]>} - A promise that resolves to an array of file objects.
 */
const filesInDirectory = (dir) =>
  new Promise((resolve) =>
    dir.createReader().readEntries((entries) =>
      Promise.all(
        entries
          .filter((e) => e.name[0] !== ".") // Ignore hidden/system files
          .map((e) =>
            e.isDirectory
              ? filesInDirectory(e) // Recursively get files from subdirectories
              : new Promise((res) => e.file(res))
          )
      )
        .then((files) => [].concat(...files)) // Flatten the array of files
        .then(resolve)
    )
  );

/**
 * Generates a timestamp representing the last modified times of all files in a directory.
 *
 * @param {DirectoryEntry} dir - The directory to scan for file modifications.
 * @returns {Promise<string>} - A promise resolving to a string containing all last-modified timestamps.
 */
const timestampForFilesInDirectory = (dir) =>
  filesInDirectory(dir).then((files) =>
    files.map((f) => f.lastModified).join() // Concatenate timestamps to detect changes
  );

/**
 * Watches a directory for file changes and reloads the extension when modifications are detected.
 *
 * @param {DirectoryEntry} dir - The directory to watch for changes.
 */
const watchChanges = (dir) => {
  let lastTimestamp;

  /**
   * Checks for file changes by comparing timestamps.
   * If a change is detected, reloads the Chrome extension.
   */
  const checkForChanges = () => {
    timestampForFilesInDirectory(dir).then((timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp; // Initialize timestamp on first check
      } else if (lastTimestamp !== timestamp) {
        console.log("File change detected. Reloading extension...");
        chrome.runtime.reload(); // Reload the extension
      }
      setTimeout(checkForChanges, 1000); // Check every second
    });
  };

  checkForChanges();
};

/**
 * Checks if the extension is running in development mode and enables hot-reloading.
 */
chrome.management.getSelf((self) => {
  if (self.installType === "development") {
    console.log("Hot-reloading enabled for development mode.");
    chrome.runtime.getPackageDirectoryEntry(watchChanges); // Start watching for changes
  }
});
