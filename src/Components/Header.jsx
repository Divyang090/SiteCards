import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import MorphOverlay from './MorphOverlay';
import { useAuth } from './AuthContext';
import AddMembersModal from '../AddingModal/AddMembersModal';
import ManageMembersModal from './ManageMembersModal';
import DeleteAccountModal from './DeleteAccountModal';
import VendorsPage from '../Pages/VendorsPage';
import { BASE_URL } from '../Configuration/Config';

const Header = ({ onNewProjectClick, onLoginClick, activeProjectsCount = 0, onClose, closeModal, companyId }) => {
  const { user, logout, openAuthModal, authFetch } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const { isDark, toggleTheme, isAnimating } = useTheme();
  const [showMorph, setShowMorph] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const [isAddMembersOpen, setIsMembersOpen] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const menuRef = useRef(null);

  const userMenuRef = useRef(null);

  //check 
  // useEffect(() => {
  //   console.log('Auth user from context:', user);
  //   console.log('Current userInfo state:', userInfo);
  // }, [user, userInfo]);

  //Extract user info
  useEffect(() => {
    if (user) {
      const normalizedUserInfo = {
        name: user.pendingLoginData?.name || 'User',
        email: user.pendingLoginData?.email || '',
        companyId: user.company_id || user.pendingLoginData?.company_id || '',
      };
      setUserInfo(normalizedUserInfo);
    } else {
      setUserInfo(null);
    }
  }, [user]);

  //check 2
  // Add this to verify the normalized structure
  // useEffect(() => {
  //   console.log('Normalized userInfo:', userInfo);
  // }, [userInfo]);

  //Click Outside
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

  //THEME
  const handleThemeToggle = () => {
    if (isAnimating) return;

    setShowMorph(true);
    toggleTheme();
  };

  const handleAnimationComplete = () => {
    setShowMorph(false);
  };

  const handleTemplatesClick = () => {
    navigate('/templates');
  };

  const handleVendorsClick =() => {
    navigate('/vendors')
  };

  //LINK PINTEREST
  const handlePinterestLink = async () => {
    try {
      const res = await authFetch(`${BASE_URL}/pinterest/start`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Backend error:", res.status);
        return;
      }

      const data = await res.json();

      if (data.auth_url) {
        // Redirect the user to Pinterest OAuth
        window.location.href = data.auth_url;
      } else {
        console.error("auth_url missing from response");
      }
    } catch (err) {
      console.error("Pinterest link failed:", err);
    }
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
          {userInfo ? (
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
                <span className="max-w-24 truncate">
                  {userInfo.name}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className=" animate-fadeInUp absolute right-0 top-12 mt-2 w-48 rounded-lg theme-border theme-bg-card border theme-shadow z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 theme-text-secondary overflow-x-auto whitespace-nowrap scrollbar-hidden text-sm border-b theme-border">
                      {userInfo.email}
                    </div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        setUserInfo(null);
                      }}
                      className="w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200 mt-1 border-b theme-border"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>

                    {/* Delete Account */}
                    <button
                      onClick={() => {
                        setIsDeleteAccountOpen(true);
                        setShowUserMenu(false);
                      }}
                      className='w-full px-2.5 py-2 rounded-md text-left flex items-center gap-3 text-red-500 transition-all duration-200 mt-1'
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Account
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
              <div className="animate-fadeInUp absolute right-0 top-12 mt-2 w-48 rounded-lg theme-border theme-bg-card border shadow-2xl z-50">
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

                  {/* Manage Members */}
                  <button
                    onClick={() => {
                      setIsManageMembersOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Teams
                  </button>

                  {/* Vendors */}
                  <button 
                  onClick={() => {
                      handleVendorsClick();
                      setShowMenu(false);
                    }}
                  className="w-full px-2 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">  <path d="M3 6h18l-2 3H5L3 6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="7" cy="13" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 20c0-2.2 1.8-4 4-4s4 1.8 4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="17" cy="13" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 20c0-2.2 1.8-4 4-4s4 1.8 4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Vendors
                  </button>

                  {/* Connect to Pinterest */}
                  <button
                    onClick={() => {
                      handlePinterestLink();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-white font-medium
                             bg-[#E60023] hover:bg-[#AD001A] active:bg-[#8A0014]
                               transition-all duration-200"
                  >
                    {/* Pinterest Logo */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="currentColor"
                      className="text-white"
                    >
                      <path d="M12 2C6.48 2 2 6.26 2 11.64c0 3.71 2.21 6.92 5.56 
                      8.29-.07-.66-.13-1.67.03-2.39.14-.6.92-3.84.92-3.84s-.23-.47-.23-1.17c0-1.1.64-1.91 1.43-1.91.68 
                      0 1 .51 1 1.12 0 .68-.43 1.69-.66 2.63-.19.79.39 1.44 1.15 1.44 1.38 0 2.44-1.46 2.44-3.56 0-1.86-1.34-3.15-3.25-3.15-2.22 
                      0-3.52 1.66-3.52 3.38 0 .67.26 1.39.58 1.78a.23.23 0 0 1 .05.22c-.06.24-.21.79-.24.9-.04.17-.13.2-.3.12-1.11-.52-1.8-2.17-1.8-3.5 
                      0-2.85 2.07-5.47 5.98-5.47 3.14 0 5.59 2.24 5.59 5.23 0 3.12-1.96 5.62-4.68 5.62-0.91 0-1.77-.47-2.07-1.02 0 0-.49 1.86-.6 2.31-.18.7-.67 
                      1.58-.99 2.12.74.23 1.53.36 2.35.36 5.52 0 10-4.26 10-9.64C22 6.26 17.52 2 12 2z" />
                    </svg>

                    Link Pinterest
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
      {isAddMembersOpen && (
        <AddMembersModal onClose={() => setIsMembersOpen(false)} />
      )}

      {isManageMembersOpen && (
        <ManageMembersModal
          onClose={() => setIsManageMembersOpen(false)}
          companyId={userInfo?.companyId}
        />
      )}

      {/* Delete Account */}
      {isDeleteAccountOpen && (
        <DeleteAccountModal onClose={() => setIsDeleteAccountOpen(false)} />
      )}

    </>
  );
};

export default Header;