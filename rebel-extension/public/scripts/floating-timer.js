console.log("Floating timer script loaded ✅");

// Timer Update Logic
function updateTimer() {
  chrome.storage.local.get(["minutes", "seconds", "isRunning"], (result) => {
    const timer = document.getElementById("timer");

    if (!result || !timer) return;

    const { minutes, seconds, isRunning } = result;

    if (typeof minutes !== "number" || typeof seconds !== "number") {
      timer.textContent = "⏹️ Stopped";
      return;
    }

    if (!isRunning) {
      timer.textContent = "⏹️ Stopped";
      return;
    }

    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    timer.textContent = `${m}:${s}`;
  });
}

setInterval(updateTimer, 1000);
updateTimer();

// Minimize / Maximize Toggle
const toggleBtn = document.getElementById("toggle-btn");
const MIN_WIDTH = 200;
const MIN_HEIGHT = 80;
const MAX_WIDTH = 260;
const MAX_HEIGHT = 150;
let isMinimized = false;

toggleBtn.addEventListener("click", () => {
  chrome.windows.getCurrent((window) => {
    if (isMinimized) {
      chrome.windows.update(window.id, {
        width: MAX_WIDTH,
        height: MAX_HEIGHT
      }, () => {
        isMinimized = false;
        toggleBtn.textContent = "Minimize Window";
      });
    } else {
      chrome.windows.update(window.id, {
        width: MIN_WIDTH,
        height: MIN_HEIGHT
      }, () => {
        isMinimized = true;
        toggleBtn.textContent = "Maximize Window";
      });
    }
  });
});

// Drag-to-Move with Bounds Clamping
let offsetX, offsetY;
let isDragging = false;

const draggable = document.getElementById("draggable");

draggable.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX;
  offsetY = e.clientY;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - offsetX;
  const dy = e.clientY - offsetY;
  offsetX = e.clientX;
  offsetY = e.clientY;

  chrome.windows.getCurrent((win) => {
    chrome.system.display.getInfo((displays) => {
      const screen = displays[0].workArea;
      const windowWidth = win.width || 260;
      const windowHeight = win.height || 150;

      let newLeft = (win.left || 0) + dx;
      let newTop = (win.top || 0) + dy;

      // Clamp to screen bounds
      newLeft = Math.max(screen.left, Math.min(screen.left + screen.width - windowWidth, newLeft));
      newTop = Math.max(screen.top, Math.min(screen.top + screen.height - windowHeight, newTop));

      chrome.windows.update(win.id, {
        left: newLeft,
        top: newTop
      });
    });
  });
});
