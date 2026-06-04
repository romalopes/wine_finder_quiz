import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="site-header">
      <NavLink className="site-logo" to="/">
        Cellar Signal
      </NavLink>
      <nav aria-label="Primary navigation">
        <NavLink to="/">Finder</NavLink>
        <NavLink to="/quiz">Quiz</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </header>
  );
}

export default Header;
