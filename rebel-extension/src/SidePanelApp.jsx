import "./SidePanelApp.css";
import CalendarView from "./components/CalendarView";
import useApplyBackgroundColor from "./hooks/useApplyBackgroundColor";
import { useEffect } from "react";

function SidePanelApp() {
  const { setTheme, themeKey } = useApplyBackgroundColor();

  const handleThemeSelection = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div>
      <CalendarView />
      <div style={{ marginTop: "1rem" }}>
        <label>Select a Theme:&nbsp;</label>
        <select
          className="reset-button"
          value={themeKey}
          onChange={handleThemeSelection}
        >
          <option value="scarletGray">Scarlet &amp; Gray</option>
          <option value="blackRed">Black &amp; Red</option>
        </select>
      </div>
    </div>
  );
}

export default SidePanelApp;
