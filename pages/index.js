import React, { useState, useEffect } from 'react';
import Login from './Login';
import { signInWithGoogle, signOutFunction } from '../lib/firebase/auth';
import LandingPage from './LandingPage';


const Home = () => {
    const [user, setUser] = useState(null);

    // Retrieve user data from session storage when the app loads
    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Parse and set the user data
        }
    }, []);

    const handleSignIn = async () => {
        let userData = null;
        try {
            userData = await signInWithGoogle();
            if (userData) {
                // Store user details in state
                setUser(userData);
                // Save user data to session storage
                sessionStorage.setItem('user', JSON.stringify(userData));
            } else {
                alert("Error signing in with Google. Please try again.");
            }
        } catch (error) {
            console.error("Error during sign-in", error);
            setUser(null); // Reset the user stateF
            sessionStorage.removeItem('user'); // Remove user data from session storage
        }
        setUser(userData);
    };

    const handleSignOut = async () => {
        try {
            console.log("Signing out...");
            await signOutFunction();
        } catch (error) {
            console.error("Error during sign-out", error);
        } finally {
            setUser(null); // Reset the user state
            sessionStorage.removeItem('user'); // Remove user data from session storage
        }
    };

    return (
        <div>
            {!user ? (
                <Login onUserSignin={handleSignIn} />
            ) : (
                <LandingPage user={user} handleSignIn={handleSignIn} onSignOut={handleSignOut} />
            )
            }
        </div>
    );
};

export default Home;