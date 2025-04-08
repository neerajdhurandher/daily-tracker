import Login from "./Login";
import NavBar from "./NavBar";
import CategoryPage from "./CategoryPage";
import PropTypes from "prop-types";

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

LandingPage.propTypes = {
    user: PropTypes.object,
    handleSignIn: PropTypes.func.isRequired,
    onSignOut: PropTypes.func.isRequired,
};
export default LandingPage;