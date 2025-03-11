importScripts('./scripts/example-script.js');
importScripts('./scripts/identity-script.js');

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});
