import { useEffect, useState } from "react";
/**
 * UserProfile Component
 *
 * Displays authenticated user's profile data and logout button.
 * - Retrieves user data from `chrome.storage.sync` on mount.
 * - Provides logout functionality that clears authentication and storage.
 *
 * Authored by: Sebastian Yepez
 * 
 * Documentation generated by ChatGPT
 * 
 * @component
 * @returns {JSX.Element} The User Profile UI.
 */

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    chrome.storage.sync.get(["user"], (data) => {
      if (data.user) {
        setUser(data.user);
      }
    });
  }, []);

  const handleLogout = () => {
    chrome.identity.getAuthToken({ interactive: false }, function (token) {
      if (token) {
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
          .then(() => console.log("OAuth token revoked"))
          .catch((err) => console.error("Failed to revoke token", err));

        chrome.identity.removeCachedAuthToken({ token }, () => {
          console.log("Cached auth token removed");
        });
      }
    });

    chrome.storage.sync.clear(() => console.log("Sync storage cleared."));
    chrome.storage.local.clear(() => console.log("Local storage cleared."));

    setUser(null);
    alert("You have been logged out.");
  };

  return (
    <div className="text-center">
      <h2>Your Profile</h2>
      {user ? (
        <>
          <img src={user.picture} alt="Profile Picture" width="60" style={{ borderRadius: '20%' }}/>
          <h5 className="mt-2">{user.name}</h5>
          <p>{user.email}</p>

          <button onClick={handleLogout} className="mb-2 rounded"> Logout </button>
        </>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
};

export default UserProfile;
