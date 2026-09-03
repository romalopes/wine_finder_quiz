import { FRONT_END_VERSION, BACK_END_VERSION } from "../constants/versions";

function Footer() {
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Wine Words</p>
      <p className="site-footer__version">
        Frontend v{FRONT_END_VERSION} &middot; Backend v{BACK_END_VERSION}
      </p>
    </footer>
  );
}

export default Footer;
