import UserEvent from "../components/UserEventInput";
import UserEventList from "../components/UserEventList";

import { useNavigate } from "react-router-dom";
import "../components/css/UserEvents.css";

/**
 * Custom Events Page
 * 
 * Authored by: Sebastian Yepez
 */
function UserEventsPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/")}>⇦</button>
      </div>

      <div className="back-button-spacer" />  

      <UserEvent />
      <UserEventList />
    </>
  );
}

export default UserEventsPage;
