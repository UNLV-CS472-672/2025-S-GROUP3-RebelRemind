import "./App.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";
import ChangeMenu from "./components/ChangeMenu";
import CalendarMenu from "./components/CalendarMenu";
import UserProfile from "./components/UserProfile";
import useAuth from "../public/hooks/useAuth";

/**
 * Main UI Layout for the Chrome Extension.
 */
function App() {
  const isAuthenticated = useAuth();

  return (
    <>
      <Counter />
      <AccordionMenu />
      <ChangeMenu />
      
      {isAuthenticated ? <UserProfile /> : <LoginButton />}
    </>
    
  );
}

export default App;
