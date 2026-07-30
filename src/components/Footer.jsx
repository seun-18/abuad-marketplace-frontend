import { ArrowUpRight, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="premium-footer">
      <div className="footer-glow" />
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <Link to="/" className="brand-mark">
              <span className="brand-gem">A</span>
              <span className="brand-name">
                ABUAD <span>MARKET PLACE</span>
              </span>
            </Link>
            <p className="footer-intro">
              A more beautiful way to discover, connect, and shop around campus.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <Instagram size={17} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={17} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={17} />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div>
              <p>Explore</p>
              <Link to="/">Discover</Link>
              <Link to="/products">Shop all</Link>
              <Link to="/cart">Shopping bag</Link>
            </div>
            <div>
              <p>Account</p>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
              <Link to="/register">Open a store</Link>
            </div>
          </div>

          <div className="footer-newsletter">
            <div className="newsletter-icon">
              <Mail size={18} />
            </div>
            <p>THE WEEKLY EDIT</p>
            <h3>Good finds, delivered.</h3>
            <span>Curated drops and campus favorites, once a week.</span>
            <form onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="Your email address" aria-label="Email address" />
              <button type="submit" aria-label="Join newsletter">
                <ArrowUpRight size={17} />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} ABUAD Market Place. All rights reserved.</p>
          <p>Secure payments · Encrypted chat · Verified accounts</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
