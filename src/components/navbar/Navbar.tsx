import { NavLink } from 'react-router';
import { FaStar } from 'react-icons/fa';
import { playClickSound } from '../../utils/sound';
import './Navbar.css';

export default function Navbar() {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Resume', path: '/resume' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
              end={link.path === '/'}
              onClick={() => playClickSound()}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
        <a
          href="https://github.com/kaif-webwork"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-star-btn"
          aria-label="GitHub Profile & Open Source"
          onClick={() => playClickSound()}
        >
          <FaStar className="navbar-star-icon" />
        </a>
      </div>
    </nav>
  );
}
