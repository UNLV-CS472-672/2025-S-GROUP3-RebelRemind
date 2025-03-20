import { useEffect, useState } from "react";

/**
 * CanvasTokenManager Component
 *
 * Manages the user's Canvas Personal Access Token (PAT).
 * - Retrieves the stored Canvas PAT from `chrome.storage.local`.
 * - Allows users to input and save a new Canvas PAT.
 * - Provides an option to toggle token visibility for better user experience.
 * 
 * Authored by: Sebastian Yepez
 * 
 * Documentation generated by ChatGPT
 *
 * @returns {JSX.Element} The Canvas Token Manager UI.
 */
const CanvasTokenManager = () => {
    const [canvasToken, setCanvasToken] = useState(""); // State for storing the token
    const [showToken, setShowToken] = useState(false); // State for toggling token visibility

    /**
     * Effect Hook: Load the stored Canvas PAT when the component mounts.
     * Fetches the token from `chrome.storage.local` and updates the state.
     */
    useEffect(() => {
        chrome.storage.local.get("canvasPAT", (data) => {
            if (data.canvasPAT) {
                setCanvasToken(data.canvasPAT);
            }
        });
    }, []);

    /**
     * Saves the entered Canvas PAT to Chrome storage.
     * Validates that the input is not empty before storing.
     */
    const saveCanvasToken = () => {
        if (!canvasToken.trim()) {
            alert("Please enter a valid token.");
            return;
        }

        chrome.storage.local.set({ canvasPAT: canvasToken }, () => {
            console.log("Canvas PAT saved.");
            alert("Your Canvas token has been securely saved.");
        });
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold mb-4">Canvas Integration</h3>

            {/* Input Field for Canvas Token */}
            <div className="relative">
                <input
                    type={showToken ? "text" : "password"} // Toggles between text and password visibility
                    placeholder="Enter Canvas Token"
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    className="border p-2 rounded w-full text-gray-700"
                />

                {/* Toggle Visibility Button */}
                <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
                >
                    {showToken ? "🙈 Hide" : "👁 Show"}
                </button>
            </div>

            {/* Save Button */}
            <button
                onClick={saveCanvasToken}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
                Save Token
            </button>
        </div>
    );
};

export default CanvasTokenManager;
