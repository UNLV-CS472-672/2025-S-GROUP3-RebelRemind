import { useEffect, useState, useRef } from "react";

import "./App.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";

/* This file defines the main UI layout for our Chrome extension’s popup or tab interface. */

function App() {
  return (
    <>
      Hello
      <Counter />
      <LoginButton />
    </>
  );
}

export default App;
