import "./css/SettingPage.css";

import LoginButton from "../components/LoginButton";
import AccordionMenu from "../components/AccordionMenu";
import UserProfile from "../components/UserProfile";
import useAuth from "../../public/hooks/useAuth";

import { useNavigate } from "react-router-dom";

/**
 * Main UI Layout for the Chrome Extension.
 */
function SettingPage() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate("/")}> ⬅️ </button>
      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </>
  );
}

export default SettingPage;
