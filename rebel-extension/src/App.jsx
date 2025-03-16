import { useEffect, useState, useRef } from "react";

import "./App.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import AccordionMenu from "./components/AccordionMenu";

/* This file defines the main UI layout for our Chrome extension’s popup or tab interface. */

function App() {
  return (
    <>
      <Counter />
      <LoginButton />
      <AccordionMenu />
    </>
    
  );
}

export default App;
