import { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isSuperUser, canManageWinesRole } from "../constants/roles";
import { categoriesApi } from "../services/api";

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div
      className="settings-menu"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="settings-menu__toggle"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>
      {open && (
        <div className="settings-menu__dropdown">
          {items.map((item) => {
            // NavLink would mark every sibling active because all items share
            // the same pathname; compare the full path + query instead.
            const isActive = location.pathname + location.search === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={isActive ? "active" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  // Editors (and reviewers/super users) may manage categories, so show the
  // Settings menu for them too; "Users & Roles" stays super-admin only.
  const canManageSettings = isSuperUser(user) || canManageWinesRole(user);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesApi
      .list()
      .then((cats) => setCategories(Array.isArray(cats) ? cats : []))
      .catch(() => {});
  }, []);

  function navCategories(flag, sortKey) {
    return categories
      .filter((c) => c[flag])
      .sort((a, b) => (a[sortKey] ?? 9999) - (b[sortKey] ?? 9999))
      .map((c) => ({
        label: c.name,
        to:
          "/" +
          flag.replace("for_", "") +
          "s?category=" +
          encodeURIComponent(c.name),
      }));
  }

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
        <NavDropdown
          label="Wines"
          items={[
            { label: "All Wines", to: "/wines" },
            ...navCategories("for_wine", "sort_order_wine"),
          ]}
        />
        <NavDropdown
          label="Reviews"
          items={[
            { label: "All Reviews", to: "/reviews" },
            ...navCategories("for_review", "sort_order_review"),
          ]}
        />
        <NavDropdown
          label="Articles"
          items={[
            { label: "All Articles", to: "/articles" },
            ...navCategories("for_article", "sort_order_article"),
          ]}
        />
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
              <NavLink to="/search" onClick={() => setExtrasOpen(false)}>
                Search
              </NavLink>
            </div>
          )}
        </div>
        <NavLink to="/about">About</NavLink>
        {canManageSettings && (
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
                {isAdmin && (
                  <NavLink to="/users" onClick={() => setSettingsOpen(false)}>
                    Users &amp; Roles
                  </NavLink>
                )}
                <NavLink
                  to="/categories"
                  onClick={() => setSettingsOpen(false)}
                >
                  Categories
                </NavLink>
                <NavLink to="/grapes" onClick={() => setSettingsOpen(false)}>
                  Grapes
                </NavLink>
                <NavLink
                  to="/countries"
                  onClick={() => setSettingsOpen(false)}
                >
                  Countries
                </NavLink>
                <NavLink to="/regions" onClick={() => setSettingsOpen(false)}>
                  Regions
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
