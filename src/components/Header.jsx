import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isSuperUser } from "../constants/roles";


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

  const isAdmin = isSuperUser(user);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);

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
        <img
          src="/wine_words.jpg"
          alt="Wine Words"
          style={{ height: "2.5rem", display: "block", borderRadius: ".35rem" }}
        />
      </NavLink>
      <nav aria-label="Primary navigation">
        <NavLink end to="/">
          Dashboard
        </NavLink>
        <NavLink to="/producers">Producers</NavLink>
        <NavLink to="/wines">Wines</NavLink>
        <NavLink to="/reviews">Reviews</NavLink>
        <NavLink to="/articles">Articles</NavLink>
        <div
          className="settings-menu"
          onMouseEnter={() => setExtrasOpen(true)}
          onMouseLeave={() => setExtrasOpen(false)}
        >
          <button
            type="button"
            className="settings-menu__toggle"
            aria-haspopup="true"
            aria-expanded={extrasOpen}
            onClick={() => setExtrasOpen((open) => !open)}
          >
            Extras
          </button>
          {extrasOpen && (
            <div className="settings-menu__dropdown">
              <NavLink to="/finder" onClick={() => setExtrasOpen(false)}>
                Finder
              </NavLink>
              <NavLink to="/quiz" onClick={() => setExtrasOpen(false)}>
                Quiz
              </NavLink>
            </div>
          )}
        </div>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/about">About</NavLink>
        {isAdmin && (
          <div
            className="settings-menu"
            onMouseEnter={() => setSettingsOpen(true)}
            onMouseLeave={() => setSettingsOpen(false)}
          >
            <button
              type="button"
              className="settings-menu__toggle"
              aria-haspopup="true"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              Settings
            </button>
            {settingsOpen && (
              <div className="settings-menu__dropdown">
                <NavLink to="/users" onClick={() => setSettingsOpen(false)}>
                  Users &amp; Roles
                </NavLink>
                <NavLink to="/categories" onClick={() => setSettingsOpen(false)}>
                  Categories
                </NavLink>
              </div>
            )}
          </div>
        )}

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
            Login / Sign up
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Header;
