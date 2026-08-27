import { Link } from 'react-router';
import { HiHome } from 'react-icons/hi2';
import Footer from '../../components/footer/Footer';
import './PageNotFound.css';

export default function PageNotFound() {
  return (
    <div className="not-found-page-wrapper">
      <div className="not-found-page">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Link to="/" className="not-found-btn">
          <HiHome />
          <span>Back to Home</span>
        </Link>
      </div>
      <Footer />
    </div>
  );
}
