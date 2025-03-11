Group 3 2025 Project Repo

A simple Hello World Chrome extension using React. 

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

