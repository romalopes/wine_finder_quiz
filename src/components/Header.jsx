import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Header() {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();

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
  const initials = getInitials(displayName || user?.email);

  return (
    <header className="site-header">
      <NavLink className="site-logo" to="/">
        Wine Prediction
      </NavLink>
      <nav aria-label="Primary navigation">
        <NavLink to="/wines">Wines</NavLink>
        <NavLink to="/">Finder</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/quiz">Quiz</NavLink>
        <NavLink to="/about">About</NavLink>

        {user ? (
          <div className="site-header__user">
            <span className="site-header__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="site-header__user-name">{displayName}</span>
            {user.email && (
              <span className="site-header__user-email">{user.email}</span>
            )}
            <button
              className="site-header__auth"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
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
