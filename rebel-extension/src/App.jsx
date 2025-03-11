import { useEffect, useState, useRef } from "react";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [countSquared, setCountSquared] = useState("");
  const [schedule, setSchedule] = useState("");
  const hasFetched = useRef(false); // ✅ Track if the request was made (ChatGPT)

  useEffect(() => {
    if (count > 0) {
      chrome.runtime.sendMessage({ type: "POST_COUNT", count }, (response) => {
        if (response) setCountSquared(response.message);
        else setCountSquared("No response from background script.");
      });
    }
  }, [count]);

  useEffect(() => {
    if (count > 5 && !hasFetched.current) {
      hasFetched.current = true;
      chrome.runtime.sendMessage({ type: "GET_SCHEDULE" }, (response) => {
        if (response) setSchedule(response.message);
        else setSchedule("No response from background script.");
      });
    }
  }, [count]);

  return (
    <>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          {countSquared
            ? `${count} squared = ${countSquared}`
            : "Calculating count squared..."}
        </p>
        <p>
          {schedule
            ? `${schedule}`
            : "Gathering your UNLV schedule (count must be > 5)..."}
        </p>
      </div>
    </>
  );
}

export default App;
