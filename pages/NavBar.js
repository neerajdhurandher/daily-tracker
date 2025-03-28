import React, { useState, useEffect, use } from 'react';

const NavBar = ({ user, onSignOut }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Prevent rendering if user is not logged in

  if (!user) return null;

  const toggleDropdown = () => {
    // Toggle dropdown visibility
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    // Close the dropdown
    setIsDropdownOpen(false);
    // Call the sign-out function passed as a prop
    onSignOut();
  };

  return (
    <nav>
      {user ? (
        <>
          <span>{user.displayName}</span>
          <img
            src={user.photoURL}
            alt="User Profile"
            onClick={toggleDropdown} // Toggle dropdown on image click
          />
          {isDropdownOpen && (
            <div className="nav-dropdown">
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </>
      ) : (
        <span>Please sign in</span>
      )}
    </nav>
  );
};

export default NavBar;