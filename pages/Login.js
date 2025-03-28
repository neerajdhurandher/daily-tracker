import React, { useState, useEffect } from 'react';

const Login = ({ onUserSignin }) => {
  const [isLoading, setIsLoading] = useState(false); // State to manage loading

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add any client-side initialization logic here if needed
    }
  }, []);

  const handleSignIn = () => {
    setIsLoading(true); // Start the loader
    try {
      onUserSignin(); // Call the sign-in function passed as a prop
    } catch (error) {
      console.error("Error during sign-in", error);
    } finally {
      setIsLoading(false); // Stop the loader
    }
  };

  const handleCancel = () => {
    setIsLoading(false); // Stop the loader
  };


  return (
    <header>
      <div className="login-container">
        <div className="header-container">
          <img
            src="/neeraj-logo.png"
            alt="Application Logo"
            className="app-logo"
          />
          <h1 className="app-title">Daily Tracker</h1>
        </div>
        <div className="login-card">
          <h1 className="login-title">Welcome</h1>
          <p className="login-subtitle">Sign in to continue</p>
          {!isLoading ? (
            <button
              className="google-signin-button"
              onClick={handleSignIn}
              disabled={isLoading} // Disable button while loading
            >
              <>
                <img
                  src="/google-icon.svg"
                  alt="Google Icon"
                  className="google-icon"
                />
                Sign in with Google
              </>
            </button>
          ) : (
            // Show loader if loading is true
            <div className="loader"></div>
          )}
          {isLoading && ( // Show cancel button only if loading is true
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Login;