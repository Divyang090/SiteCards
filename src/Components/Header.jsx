import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './Theme';

const Header = ({ onNewProjectClick, onLoginClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleTemplatesClick = () => {
    navigate('/templates');
  };

  return (
    <div className="flex justify-between items-center mb-8 theme-bg-primary theme-text-primary">
      <div>
        <Link
          to="/"
          className="text-2xl font-bold theme-text-primary hover:opacity-70 transition-opacity duration-200"
        >
          SiteCards
        </Link>
        {/* <p className="theme-text-secondary mt-1">3 active projects</p> */}
      </div>
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        {/* <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 flex items-center gap-2 theme-border theme-text-primary theme-bg-secondary border"
        >
          {isDark ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Light</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Dark</span>
            </>
          )}
        </button> */}

        <button
          onClick={handleTemplatesClick}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 theme-border theme-text-primary theme-bg-secondary border"
        >
          Templates
        </button>
        <button
          onClick={onLoginClick}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 theme-border theme-text-primary theme-bg-secondary border"
        >
          Login
        </button>
        <button
          onClick={onNewProjectClick}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 flex items-center gap-2 text-white theme-accent border-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>
    </div>
  );
};

export default Header;