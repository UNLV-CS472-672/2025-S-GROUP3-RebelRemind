import { useState } from "react";

const LoginButton = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

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
        <div>
          <p>Logged in as: {user.email}</p>
          <img src={user.picture} alt="Profile" width="50" />
        </div>
      ) : (
        <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">
          Login with Google
        </button>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default LoginButton;
