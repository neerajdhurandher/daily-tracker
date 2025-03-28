import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged as _onAuthStateChanged } from './firebase';

export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    let data = await signInWithPopup(auth, provider);
    console.log("User singed in with Google successfully");
    console.log(data);
    return data.user;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("The login popup was closed by the user.");
    } else {
      console.error("Error signing in with Google", error);
    } 
    return null;
  }
}

export async function signOutFunction() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}