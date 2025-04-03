(() => {
    const existing = document.getElementById("floating-pomodoro-widget");
    if (existing) {
      existing.remove();
      console.log("[Widget] Removed floating widget 🧹");
    }
  })();
  