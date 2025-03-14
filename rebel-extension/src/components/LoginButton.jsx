import { useState } from "react";

/**
 * LoginButton Component
 *
 * This component handles user authentication via Google OAuth in a Chrome extension.
 * It sends a message to the background script to initiate login and updates the UI
 * based on authentication status.
 *
 * Features:
 * - Displays a login button if the user is not authenticated.
 * - Sends a login request to the background script via `chrome.runtime.sendMessage`.
 * - Updates the UI to show user details upon successful login.
 * - Displays an error message if authentication fails.
 *
 * Authored by: Sebastian Yepez
 * Documentation generated by ChatGPT
 * 
 * @returns {JSX.Element} The LoginButton component UI.
 */
const LoginButton = () => {
  // State to store authenticated user info
  const [user, setUser] = useState(null);

  // State to store any login errors
  const [error, setError] = useState(null);

  /**
   * Handles the login process by sending a message to the background script.
   * - If authentication succeeds, updates the user state.
   * - If authentication fails, updates the error state.
   */
  const handleLogin = () => {
    chrome.runtime.sendMessage({ type: "LOGIN" }, (response) => {
      if (response.success) {
        setUser(response.user);
        console.log("User logged in:", response.user);
      } else {
        setError(response.error);
        console.error("Login failed:", response.error);
      }
    });
  };

  return (
    <div>
      {user ? (
        // Display user information when logged in
        <div>
          <p>Logged in as: {user.email}</p>
          <img src={user.picture} alt="Profile" width="50" />
        </div>
      ) : (
        // Display login button if user is not authenticated
        <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">
          Login with Google
        </button>
      )}

      {/* Display an error message if login fails */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default LoginButton;
