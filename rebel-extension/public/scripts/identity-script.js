function authenticateUser(sendResponse) {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Authentication Error:", chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
  
      console.log("Access Token:", token);
  
      // Fetch user info
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((userInfo) => {
          console.log("User Info:", userInfo);
          sendResponse({ success: true, user: userInfo });
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
          sendResponse({ success: false, error: "Failed to fetch user info" });
        });
    });
  
    return true; // Keeps the message channel open for async response
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "LOGIN") {
      authenticateUser(sendResponse);
      return true;
    }
  });
  