import React, { useState } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';


const NavBar = ({ user, onSignOut }) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const basePath = process.env.BASE_PATH || '';

  // Prevent rendering if user is not logged in
  if (!user) return null;

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    onSignOut();
  };

  const handleFeedback = () => {
    setIsDropdownOpen(false);
    // Open feedback form in a new tab
    window.open('https://forms.gle/HLoST9hdbcLcHozz8', '_blank');
  }

  return (
    <nav>
      {user ? (
        <>
          <Image
            src={`${basePath}/neeraj-logo.png`}
            alt="App Logo"
            className="app-logo"
            onClick={toggleDropdown}
            width={40}
            height={40}
          />
          <span className="app-name">Daily Tracker</span>
          <Image
            src={user.photoURL}
            alt="User Profile"
            className='user-profile-pic'
            onClick={toggleDropdown}
            width={40}
            height={40}
          />
          {isDropdownOpen && (
            <div className="nav-dropdown">
              <div className="dropdown-item username">{user.displayName}</div>
              <div className="dropdown-item" onClick={handleFeedback}>
                Feedback
              </div>
              <div className="dropdown-item signout" onClick={handleSignOut}>
                Sign Out
              </div>
            </div>
          )}
        </>
      ) : (
        <span>Please sign in</span>
      )}
    </nav>
  );
};
NavBar.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
  }).isRequired,
  onSignOut: PropTypes.func.isRequired,
};

export default NavBar;