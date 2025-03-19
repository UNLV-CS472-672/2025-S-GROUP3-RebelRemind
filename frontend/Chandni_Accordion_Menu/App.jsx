// Chandni's Accordion Menu Implementation

// This version is the best one out of the other ones I wrote
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap styles are applied
import Accordion from "react-bootstrap/Accordion";
import "./App.css"; // Custom CSS for extra styling

function AlwaysOpenExample() {
  return (
    <Accordion alwaysOpen className="custom-accordion"> {/* Allows multiple sections to stay open */}
      <Accordion.Item eventKey="0" className="accordion-item-1">
        <Accordion.Header>📚 Upcoming Assignments</Accordion.Header>
        <Accordion.Body>
          <strong>CS 405:</strong> Homework 3 due by this Sunday <strong> <br />
          <strong> CS 472:</strong> DP II</strong> due by next week Tuesday.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1" className="accordion-item-2">
        <Accordion.Header>📅 Your Events</Accordion.Header>
        <Accordion.Body>
          General Meeting - <strong> 11:30 AM </strong> with <strong>Hindu Yuva Club</strong>. <br />
          Office Hours - <strong>2:00 PM </strong> with the GOAT 🐐 Kishore.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2" className="accordion-item-3">
        <Accordion.Header>🏀 UNLV Events</Accordion.Header>
        <Accordion.Body>
          🏀 UNLV <strong>Basketball Game - </strong> 5:00 PM <strong>!</strong>. <br />
          🐶 Pet therapy - 3:00 PM located in the <strong>Lied Library</strong>!
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="text-center p-4">
        <button className="btn btn-danger shadow-lg" onClick={() => setCount(count + 1)}>
          🎉 Rebel Remind for the win! {count}
        </button>
      </div>
      <AlwaysOpenExample />
    </>
  );
}

export default App;
