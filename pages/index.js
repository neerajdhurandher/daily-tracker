import React, { useState, useEffect } from 'react';
import Login from './Login';
import { signInWithGoogle, signOutFunction } from '../lib/firebase/auth';
import LandingPage from './LandingPage';


const Home = () => {
    const [user, setUser] = useState(null);

    // Retrieve user data from local storage when the app loads
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if ((storedUser) && checkLoginValidity(JSON.parse(storedUser)['last-login'])) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const checkLoginValidity = (loginDate) => {
        const validInterval = 2592000000; // 30 days in milliseconds
        const currentDate = new Date();
        const storedDate = new Date(loginDate);
        const differenceInDays = (currentDate - storedDate) 
        return !(differenceInDays <= validInterval); // Valid if within 30 days
    };

    const handleSignIn = async () => {
        let userData = null;
        try {
            userData = await signInWithGoogle();
            if (userData) {
                const currentTimestamp = Date.now();
                const timestampString = new Date(currentTimestamp).toISOString();
                userData['last-login'] = timestampString;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                alert("Error signing in with Google. Please try again.");
            }
        } catch (error) {
            console.error("Error during sign-in", error);
            setUser(null);
            localStorage.removeItem('user');
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
            localStorage.removeItem('user');
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