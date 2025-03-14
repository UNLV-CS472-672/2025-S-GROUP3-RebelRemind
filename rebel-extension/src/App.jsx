import { useEffect, useState, useRef } from "react";

import "./App.css";
import LoginButton from "./components/LoginButton";
import Counter from "./components/Counter";
import Accordion from 'react-bootstrap/Accordion';
import 'bootstrap/dist/css/bootstrap.min.css';

/* This file defines the main UI layout for our Chrome extension’s popup or tab interface. */

function App() {
  return (
    <>
      <Counter />
      <LoginButton />
      <Accordion defaultActiveKey={['0']} alwaysOpen>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Upcoming Assignments</Accordion.Header>
        <Accordion.Body>
          • CS405 - Assignment 2 <br />
          • CS422 - Assignment 3 <br />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Your Events</Accordion.Header>
        <Accordion.Body>
          • Kat Parsons (CS251X Office Hours) <br />
          	&emsp;&emsp;&emsp; March 15th, 2025 - 1:00 PM
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>UNLV Events</Accordion.Header>
        <Accordion.Body>
          • UNLV Volleyball Tryouts: <br />
          	&emsp;&emsp;&emsp; March 31st, 2025 - 4:00 PM
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
    </>
    
  );
}

export default App;
