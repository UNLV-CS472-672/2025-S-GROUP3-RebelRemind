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
   cd rebel_remind
```
```sh
   npm install
```

## Deploying the Chrome Extension

### To view the SPA in a localhost browser with 'compile on save':

```sh
   npm run dev
```
1. Navigate to localhost

### To create a build folder for deploying in Chrome Extension:

```sh
   npm run build
```

1. Navigate to chrome://extensions/
2. Select developer mode in the top right
3. Select **Load Unpacked** in the top left
4. Navigate to the project and upload the **build** folder



