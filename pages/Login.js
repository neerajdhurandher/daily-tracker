import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';

const Login = ({ onUserSignin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const basePath = process.env.NEXT_BASE_PATH; 

  const handleSignIn = () => {
    console.log("Sign-in button clicked");
    setIsLoading(true); 
    try {
      onUserSignin(); // Call the sign-in function passed as a prop
    } catch (error) {
      console.error("Error during sign-in", error);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleCancel = () => {
    setIsLoading(false); 
  };
  
  // opens google.com in a new tab
  const handleLogoClick = () => {
    window.open('https://neerajdhurandher.me', '_blank');
  };


  return (
    <header>
      <div className="login-container">
        <div className="header-container">
          <Image
            src={`${basePath}/neeraj-logo.png`}
            alt="Application Logo"
            className="app-logo"
            width={50}
            height={50}
            onClick={handleLogoClick}
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
              <Image
                src={`${basePath}/google-icon.svg`}
                alt="Google Icon"
                className="google-icon"
                width={20}
                height={20}
              />
              Sign in with Google
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

        <footer className="footer">
          Made with <span className="heart">❤️</span> by <span style={{ color: '#ffe600' }}>Neeraj Dhurandher</span>
        </footer>
      </div>
    </header>
  );
};
Login.propTypes = {
  onUserSignin: PropTypes.func.isRequired,
};

export default Login;