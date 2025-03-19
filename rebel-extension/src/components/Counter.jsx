import { useEffect, useState, useRef } from "react";

/**
 * Counter Component - Tracks a count, calculates its square, and fetches a schedule when count > 5.
 * Uses Chrome Messaging API to communicate with the background script.
 *
 * Features:
 * - Increments a count value when the user clicks a button.
 * - Requests the squared value of the count from the background script.
 * - Fetches a schedule when `count > 5`, displaying "Please wait..." while fetching.
 *
 * Authored by: Billy Estrada
 * 
 * Put into component Counter.jsx by: Sebastian Yepez
 * 
 * Generated documentation with ChatGPT
 * 
 * @returns {JSX.Element} The Counter component UI.
 */
function Counter() {
    // State variables
    const [count, setCount] = useState(0); // User's count value
    const [countSquared, setCountSquared] = useState(""); // Stores squared value of count
    const [schedule, setSchedule] = useState(""); // Stores retrieved schedule
    const [isFetchingSchedule, setIsFetchingSchedule] = useState(false); // Tracks if schedule is being fetched
    const hasFetched = useRef(false); // Ensures schedule is fetched only once
    const [canvasIntegration, setCanvasIntegration] = useState(false);

    /**
     * useEffect - Sends count value to the background script to get its square.
     * Runs whenever `count` changes and `count > 0`.
     */
    useEffect(() => {
        if (count > 0) {
            chrome.runtime.sendMessage({ type: "POST_COUNT", count }, (response) => {
                if (response) setCountSquared(response.message);
                else setCountSquared("No response from background script.");
            });
        }
    }, [count]);

    /**
     * useEffect - Fetches schedule from the background script when `count > 5`.
     * Prevents duplicate requests using `hasFetched.current`.
     */
    useEffect(() => {
        if (count > 5 && !hasFetched.current) {
            hasFetched.current = true;
            setIsFetchingSchedule(true); // Start loading indicator
            new Promise ((resolve) => {
                chrome.runtime.sendMessage({ type: "GET_PREFERENCES" }, (response) => {
                    if (response && response.preferences) {
                        const canvasIntegrationPreference = response.preferences.canvasIntegration;
                        if (canvasIntegrationPreference) {
                            setCanvasIntegration(true);
                            resolve(canvasIntegrationPreference);
                        }
                        else {
                            setCanvasIntegration(false);
                            alert("Canvas Integration is disabled!")
                            resolve(canvasIntegrationPreference);
                        }
                    } else {
                        setCanvasIntegration(false);
                        alert("No preferences set!");
                        resolve(false);
                    }
                });
            }).then((canvasIntegrationPreference) => {
                if(canvasIntegrationPreference) {
                    chrome.runtime.sendMessage({ type: "GET_SCHEDULE" }, (response) => {
                        setIsFetchingSchedule(false); // Stop loading indicator
    
                        if (response) setSchedule(response.message);
                        else setSchedule("No response from background script.");
                    });
                }
                else {
                    setIsFetchingSchedule(false);
                    setSchedule("Unable to fetch schedule");
                }
            });
        }
    }, [count]);

    /**
     * Handles button click to increment the count value.
     */
    const handleIncrement = () => {
        setCount((prev) => prev + 1);
    };

    return (
        <div>
            {/* Button to increase count */}
            <button onClick={handleIncrement}>Count is {count}</button>

            {/* Displays squared value of count */}
            <p>
                {countSquared
                    ? `${count} squared = ${countSquared}`
                    : "Calculating count squared..."}
            </p>

            {/* Displays schedule or relevant messages */}
            <p>
                {isFetchingSchedule
                    ? "Please wait..." // Show while fetching
                    : schedule
                    ? canvasIntegration ? `${schedule}`: "Canvas Integration is disabled, cannot display schedule!"
                    : "Gathering your UNLV schedule (count must be > 5)..."}
            </p>
        </div>
    );
}

export default Counter;
