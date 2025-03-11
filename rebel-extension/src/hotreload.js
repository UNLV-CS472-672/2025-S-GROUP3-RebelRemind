/**
 * This file enables hot-reloading for our Chrome extension during development.
 * 
 * This script forces the extension to reload when a change is detected.
 * 
 * It listens for file updates and automatically reloads the extension.
 * 
 * This eliminates the need to manually reload from chrome://extensions/.
 * 
 */ 

const filesInDirectory = (dir) =>
  new Promise((resolve) =>
    dir.createReader().readEntries((entries) =>
      Promise.all(
        entries
          .filter((e) => e.name[0] !== ".")
          .map((e) =>
            e.isDirectory
              ? filesInDirectory(e)
              : new Promise((res) => e.file(res))
          )
      )
        .then((files) => [].concat(...files))
        .then(resolve)
    )
  );

const timestampForFilesInDirectory = (dir) =>
  filesInDirectory(dir).then((files) =>
    files.map((f) => f.lastModified).join()
  );

const watchChanges = (dir) => {
  let lastTimestamp;

  const checkForChanges = () => {
    timestampForFilesInDirectory(dir).then((timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      } else if (lastTimestamp !== timestamp) {
        chrome.runtime.reload();
      }
      setTimeout(checkForChanges, 1000);
    });
  };

  checkForChanges();
};

chrome.management.getSelf((self) => {
  if (self.installType === "development") {
    chrome.runtime.getPackageDirectoryEntry(watchChanges);
  }
});
