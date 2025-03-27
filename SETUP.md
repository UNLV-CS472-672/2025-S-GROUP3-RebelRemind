Setup Instructions for Rebel Remind

# Getting Started with Create React App

Add origin (if you haven't done so already)

```sh
   git remote add origin https://github.com/UNLV-CS472-672/2025-S-GROUP3-RebelRemind.git
```

Pull the latest changes from the remote repo

```sh
   git checkout main
   git pull origin main
```

## Installing dependencies

```sh
   cd rebel-extension
```

```sh
   npm install
```

```sh
   cd ../backend
```

```sh
   npm install
```

## Deploying the Chrome Extension

### To create a build folder for deploying in Chrome Extension:

Inside the /backend folder start the backend server. Leave this terminal open as your backend.

```sh
   npm run dev
```

In a separate terminal, navigate to your /rebel-extension folder

```sh
   npm run build
```

1. Navigate to chrome://extensions/
2. Select developer mode in the top right
3. Select **Load Unpacked** in the top left
4. Navigate to the project and upload the **dist** folder

### To recompile

```sh
   npm run build
```

1. Navigate to chrome://extensions/
2. Hit the reload button on the RebelRemind chrome extension

### An overview of the Chrome Extension infrastructure

The /rebel-extension folder contains our chrome extensions.
Here, any API calls will need to go through background.js

Located at rebel-extension/public/background.js

This background worker will be capable of making external calls to our server.

The backend server will handle requests, and return a response. By doing it this way, we abstract the backend server from our actual chrome extension. Furthermore, by issuing all requests from the background.js file, we can make external requests while the extension is closed.

If an API call was made directly from the React javascript, it would only be allowed if the pop up is open.

### To test the front end with jest

```sh
   cd rebel-extension
```

```sh
   npm install
```

```sh
   npm test
```

## Using the Chrome Extension

After opening the popup for the first time, you will be prompted to login with your UNLV provided Google account. After logging in, you will have access to all of Rebel Remind's features.

### Connecting to Canvas

To utilize Rebel Remind's Canvas connectivity, you need to set it up. 
First, set your "Canvas Integration" preference on the "Settings" page to "Enabled" and click "Save Preferences".
Now you will need to generate your Canvas Access Token.

Log into Canvas in your browser.
On the left panel, select "Account". Select "Settings" from the popup.
Search for "Approved Integrations". This will be a list of any third-party apps that have access to your Canvas data.
Select the "New Access Token" button. This will bring up a popup for generating a new Canvas Access Token for your account.
Enter "Rebel Remind" for the purpose and select "Generate Token". (You can enter an expiration date if you would like but not necessary.)
This will display your "Access Token Details" and give you your token. Make sure you copy the token to a safe place for future use because you will be unable to view the token again after closing the popup.
Return to the popup and paste your Canvas Access Token into the token field and click "Save Token". Now chrome.storage should have your token stored.
Click on "Get Your Canvas Assignments" on the main page to load your Canvas assignments into the extension storage. A confirmation popup will show this is completed.
Feel free to add any events in the "Personalize Events" menu. These will also appear in the calendar.
Now you can load the calendar by clicking "Calendar View".
You should be able to find any Canvas due dates and created events in your calendar.
