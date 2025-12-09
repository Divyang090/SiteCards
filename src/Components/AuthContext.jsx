import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { BASE_URL } from '../Configuration/Config';

const AuthContext = createContext();

// API endpoints
const REFRESH_TOKEN_API = `${BASE_URL}/auth/refresh`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Prevent multiple concurrent refresh attempts
  const isRefreshing = useRef(false);

  // Load auth data from localStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedAccessToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');

      if (savedUser && savedAccessToken) {
        setUser(JSON.parse(savedUser));
        setAccessToken(savedAccessToken);
        if (savedRefreshToken) {
          setRefreshToken(savedRefreshToken);
        }

        // 🔍 Decode company_id + user_id
        try {
          const decoded = JSON.parse(atob(savedAccessToken.split(".")[1]));
          setCompanyId(decoded.company_id);
          setUserId(decoded.user_id);
        } catch (e) {
          console.error("Failed to decode access token:", e);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    if (isRefreshing.current) {
      return null;
    }

    isRefreshing.current = true;

    try {
      const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');

      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(REFRESH_TOKEN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: currentRefreshToken
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 422) {
          logout();
          return null;
        }
        throw new Error('Refresh token failed');
      }

      const data = await response.json();
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token;

      if (newAccessToken) {
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);

        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        return newAccessToken;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      logout();
      return null;
    } finally {
      isRefreshing.current = false;
    }
  };

  // Enhanced login function that stores tokens
  const login = (userData, tokens = {}) => {
    const enhancedUser = {
      ...userData,
      company_id: userData.company_id,
    };

    setUser(enhancedUser);

    if (tokens.accessToken) {
      setAccessToken(tokens.accessToken);
      localStorage.setItem('accessToken', tokens.accessToken);
    }

    if (tokens.refreshToken) {
      setRefreshToken(tokens.refreshToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }

    localStorage.setItem('user', JSON.stringify(enhancedUser));

    setShowAuthModal(false);
    setLoading(false);
  };

  //logout
  const logout = async () => {
    try {
      const rt = refreshToken || localStorage.getItem("refreshToken");

      if (rt) {
        fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: rt }),
        }).catch(() => { });
      }
    } catch (err) {
      // Ignore errors
    } finally {
      // Always clear frontend state
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setShowAuthModal(false);
      setLoading(false);

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  // Enhanced fetch with automatic token refresh
  const authFetch = async (url, options = {}) => {
    let token = accessToken || localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };

      // Only set JSON content-type if body is NOT FormData
      if (!(options.body instanceof FormData) && options.body !== undefined && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration
      if (response.status === 401 || response.status === 422) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Retry the request with new token
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      return response;
    } catch (err) {
      throw err;
    }
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const value = {
    user,
    accessToken,
    login,
    logout,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    authFetch,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};