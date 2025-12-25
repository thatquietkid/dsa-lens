import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="navbar-modern">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="brand-link">
            <div className="brand-logo">
              {/* Increased SVG size to 28x28 */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="brand-name">DSALens</span>
          </Link>
          {/* Workspace badge/dot removed from here */}
        </div>

        {!isHome && (
          <div className="nav-center">
            <div className="nav-pills">
              <button className="pill active">Editor</button>
              <button className="pill">Visualizer</button>
              <button className="pill">Learn</button>
            </div>
          </div>
        )}

        <div className="nav-right">
          {/* <button className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button> */}
          <div className="divider-v"></div>
          <button className="profile-trigger">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nitin" alt="avatar" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;