import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <div>
        <Link to="/">AETHENIX</Link>
        <p>Compete. Record. Rise.</p>
      </div>

      <div>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/refund-policy">Refund Policy</Link>
      </div>

      <p>© 2026 AETHENIX. All rights reserved.</p>
    </footer>
  );
};

export default Footer;