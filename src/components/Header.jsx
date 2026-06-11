import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { user, session, signOut } = useAuth();
  const [loading, setLoading] = useState(true);

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  function getDisplayName() {
    if (!session || !user) return null;
    return (
      user.name ||
      user.displayName ||
      (user.email ? user.email.split("@")[0] : null)
    );
  }

  const displayName = getDisplayName();

  return (
    <header className="site-header">
      <NavLink className="site-logo" to="/">
        Cellar Signal - Wine Prediction
      </NavLink>
      <nav aria-label="Primary navigation">
        <NavLink to="/wines">Wines</NavLink>
        <NavLink to="/">Finder</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/quiz">Quiz</NavLink>
        <NavLink to="/about">About</NavLink>
        {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
        {user ? (
          <>
            <span className="site-header__user-name">{displayName}</span>
            <button
              className="site-header__auth"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </>
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
