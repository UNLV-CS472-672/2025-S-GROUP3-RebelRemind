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
      <button className="mb-4" onClick={() => navigate("/")}> ⬅️ </button>
      <UserEvent />
      <UserEventList />
    </>
  );
}

export default UserEventsPage;
