import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function Header() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  return (
    <header className="site-header">
      <NavLink className="site-logo" to="/">
        Cellar Signal
      </NavLink>
      <nav aria-label="Primary navigation">
        <NavLink to="/">Finder</NavLink>
        <NavLink to="/quiz">Quiz</NavLink>
        <NavLink to="/about">About</NavLink>
        {currentUser ? (
          <button
            className="site-header__auth"
            onClick={handleSignOut}
            type="button"
          >
            Sign out
            {currentUser.email ? <small> ({currentUser.email})</small> : null}
          </button>
        ) : (
          <NavLink className="site-header__auth" to="/login">
            Sign in
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Header;
