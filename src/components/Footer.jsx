import { VERSION_FRONT_END, VERSION_BACK_END } from "../constants/versions";

function Footer() {
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Wine Words</p>
      <p className="site-footer__version">
        Frontend v{VERSION_FRONT_END} &middot; Backend v{VERSION_BACK_END}
      </p>
    </footer>
  );
}

export default Footer;
