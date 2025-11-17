import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import MorphOverlay from './MorphOverlay';
import { useAuth } from './AuthContext';

const Header = ({ onNewProjectClick, onLoginClick, activeProjectsCount = 0, onClose }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { isDark, toggleTheme, isAnimating } = useTheme();
  const [showMorph, setShowMorph] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
        userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeToggle = () => {
    if (isAnimating) return;

    setShowMorph(true);
    // Trigger the theme toggle which will update CSS variables
    toggleTheme();
  };

  const handleAnimationComplete = () => {
    setShowMorph(false);
  };

  const handleTemplatesClick = () => {
    navigate('/templates');
  };

  return (
    <>
      {/* Morph Overlay */}
      {showMorph && (
        <MorphOverlay
          isDark={isDark}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      <div className="flex justify-between items-center mb-8 theme-bg-primary theme-text-primary header">
        <div>
          <Link
            to="/"
            className="md:text-2xl text-xl font-bold theme-text-primary hover:opacity-70 transition-opacity duration-200"
          >
            SiteCards
          </Link>
          <p className="theme-text-secondary mt-1">
            {activeProjectsCount} active project{activeProjectsCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* User/Login Section */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg theme-border theme-text-primary theme-bg-secondary border hover:opacity-80 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full theme-bg-primary flex items-center justify-center border theme-border">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="max-w-24 truncate">{user.name}</span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 mt-2 w-48 rounded-lg theme-border theme-bg-card border theme-shadow z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 theme-text-secondary text-sm border-b theme-border">
                      {user.email}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200 mt-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 theme-border theme-text-primary theme-bg-secondary border"
            >
              Login
            </button>
          )}

          {/* Hamburger Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg theme-border theme-text-primary theme-bg-secondary border hover:opacity-80 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 mt-2 w-48 rounded-lg theme-border theme-bg-card border theme-shadow z-50">
                <div className="p-2">

                  {/* New Project */}
                  <button
                    onClick={() => {
                      onNewProjectClick();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                  </button>

                  {/* Templates */}
                  <button
                    onClick={() => {
                      handleTemplatesClick();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Templates
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => {
                      handleThemeToggle();
                      setShowMenu(false);
                    }}
                    disabled={isAnimating}
                    className={`w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200 ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isDark ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light Mode
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark Mode
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;