import Pomodoro from "../components/PomodoroTimer";
import { useNavigate } from "react-router-dom";

/**
 * Main UI Layout for the Chrome Extension.
 */
function HomePage() {
  const navigate = useNavigate();

  return (
    <>
    <button onClick={() => navigate("/")}> ⬅️ </button>
    <Pomodoro />
  </>
  );
}

export default HomePage;
