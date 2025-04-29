function createFloatingWidget() {
    // Avoid injecting it twice
    if (document.getElementById("floating-pomodoro-widget")) return;
  
    const widget = document.createElement("div");
    widget.id = "floating-pomodoro-widget";
    widget.style.position = "fixed";
    widget.style.bottom = "20px";
    widget.style.right = "20px";
    widget.style.width = "140px";
    widget.style.height = "60px";
    widget.style.background = "#fff3f3";
    widget.style.color = "#333";
    widget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
    widget.style.borderRadius = "10px";
    widget.style.display = "flex";
    widget.style.alignItems = "center";
    widget.style.justifyContent = "center";
    widget.style.fontSize = "1.5rem";
    widget.style.fontFamily = "Arial, sans-serif";
    widget.style.zIndex = "999999";
    widget.style.cursor = "move";
    widget.style.userSelect = "none";
  
    document.body.appendChild(widget);
  
    // Drag logic
    let isDragging = false;
    let offsetX, offsetY;
  
    widget.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - widget.getBoundingClientRect().left;
      offsetY = e.clientY - widget.getBoundingClientRect().top;
    });
  
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      widget.style.left = `${e.clientX - offsetX}px`;
      widget.style.top = `${e.clientY - offsetY}px`;
      widget.style.right = "auto";
      widget.style.bottom = "auto";
      widget.style.position = "fixed";
    });
  
    function updateTimerDisplay() {
      chrome.storage.local.get(["minutes", "seconds", "isRunning"], ({ minutes, seconds, isRunning }) => {
        if (!isRunning) {
          widget.textContent = "⏹️";
        } else {
          const m = String(minutes).padStart(2, '0');
          const s = String(seconds).padStart(2, '0');
          widget.textContent = `${m}:${s}`;
        }
      });
    }
  
    setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
  }
  
// Only create the widget if the timer is running
chrome.storage.local.get("isRunning", ({ isRunning }) => {
  if (isRunning) {
    createFloatingWidget();
  }
});
  