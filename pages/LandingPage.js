import react from "react";
import Login from "./Login";
import NavBar from "./NavBar";
import CategoryPage from "./CategoryPage";
const LandingPage = ({ user, handleSignIn, onSignOut }) => {
    return (
        <>
            {!user ? (
                <Login onUserSignin={handleSignIn} />
            ) : (
                <div>
                    <div className="nav">
                        <NavBar user={user} onSignOut={onSignOut} />
                    </div>
                    <CategoryPage user={user} />
                </div>
            )}
        </>
    );
}
export default LandingPage;