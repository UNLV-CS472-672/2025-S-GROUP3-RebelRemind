/**
 * CanvasLogin Component
 * 
 * Renders a button that redirects users to the Canvas login page when clicked. The link opens in a new tab
 * for easy login for people that want to login with Canvas in the chrome extension.
 * 
 * Dependencies:
 * - React: JavaScript library for building user interfaces.
 * - CSS classes: `canvas-login-button-container` for the container and `canvas-login-button` for styling the button.
 * 
 * Usage:
 * - Use the `CanvasLogin` component to display a login button that redirects to the Canvas login page.
 * - To style the button and container, define styles for the above classes in our App.css.
 * 
 * Example Usage in `App.jsx`:
 * 
 * import CanvasLogin from "./components/CanvasLogin";
 * 
 * function App() {
 *   return <CanvasLogin />;
 * }
 * 
 * Authored: Chandni Mirpuri Silva
 * 
 * Documentation by Chatgpt
 */

import React from "react";

// CanvasLogin component
const CanvasLogin = () => {
  console.log("CanvasLogin component is rendered!");

  return (
    <div className="canvas-login-button-container">
      <a
        href="https://unlv.instructure.com/login/saml"
        target="_blank" // Open in new tab
        rel="noopener noreferrer" // Security measure
      >
        <button className="canvas-login-button">
          Login with Canvas
        </button>
      </a>
    </div>
  );
};

export default CanvasLogin;
