import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand-mark">
            <span className="brand-gem">A</span>
            <span className="brand-name">
              ABUAD <span>MARKET PLACE</span>
            </span>
          </Link>
          <p>
            The trusted campus marketplace for students and sellers at Afe Babalola University.
            Discover, connect, and shop with confidence.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/">Discover</Link>
            <Link to="/products">Shop all</Link>
            <Link to="/cart">Shopping bag</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
            <Link to="/register">Open a store</Link>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/products">Help centre</Link>
            <Link to="/products">Buyer protection</Link>
            <Link to="/products">Seller guide</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} ABUAD Market Place · Secure payments · Verified sellers</p>
      </div>
    </footer>
  );
};

export default Footer;
