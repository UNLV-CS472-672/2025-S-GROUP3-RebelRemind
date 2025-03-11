chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "POST_COUNT") {
    fetch("http://localhost:3001/count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: message.count }),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ message: data.message }))
      .catch((err) => sendResponse({ message: "Error fetching data" }));

    return true; // Keeps sendResponse alive asynchronously
  }
  if (message.type === "GET_SCHEDULE") {
    fetch("http://localhost:3001/schedule", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ message: data.message }))
      .catch((err) => sendResponse({ message: "Error fetching data" }));

    return true; // Keeps sendResponse alive asynchronously
  }
});
