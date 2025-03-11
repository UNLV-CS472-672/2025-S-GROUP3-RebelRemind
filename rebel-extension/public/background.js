importScripts('./myscripts/example-script.js');

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed!");
  });
  