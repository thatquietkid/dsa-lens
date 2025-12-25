import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useView } from '../../context/ViewContext'; // Import hook

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { activeTab, setActiveTab } = useView(); // Use hook

  return (
    <nav className="navbar-modern">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="brand-link">
            <div className="brand-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20"/>
              </svg>
            </div>
            <span className="brand-name">DSALens</span>
          </Link>
        </div>

        {!isHome && (
          <div className="nav-center">
            <div className="nav-pills">
              <button 
                className={`pill ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                Editor
              </button>
              <button 
                className={`pill ${activeTab === 'visualizer' ? 'active' : ''}`}
                onClick={() => setActiveTab('visualizer')}
              >
                Visualizer
              </button>
              <button 
                className={`pill ${activeTab === 'learn' ? 'active' : ''}`}
                onClick={() => setActiveTab('learn')}
              >
                Learn
              </button>
            </div>
          </div>
        )}

        <div className="nav-right">
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