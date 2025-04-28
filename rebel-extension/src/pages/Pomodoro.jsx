import Pomodoro from "../components/PomodoroTimer";
import { useNavigate } from "react-router-dom";

/**
 * Main UI Layout for the Chrome Extension.
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="pomodoro-page-wrapper">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/")}>⇦</button>
      </div>

      <div className="pomodoro-center">
        <Pomodoro />
      </div>
    </div>
  );
}

export default HomePage;