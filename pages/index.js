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
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleSignIn = async () => {
        let userData = null;
        try {
            userData = await signInWithGoogle();
            if (userData) {
                setUser(userData);
                sessionStorage.setItem('user', JSON.stringify(userData));
            } else {
                alert("Error signing in with Google. Please try again.");
            }
        } catch (error) {
            console.error("Error during sign-in", error);
            setUser(null); 
            sessionStorage.removeItem('user');
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
            setUser(null); 
            sessionStorage.removeItem('user');
            // remove all local storage data
            localStorage.removeItem('tasks');
            localStorage.removeItem('categories'); 
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