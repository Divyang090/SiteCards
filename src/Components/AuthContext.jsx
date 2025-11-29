import React, { createContext, useState, useContext, useEffect } from 'react';
import { BASE_URL } from '../Configuration/Config';

const AuthContext = createContext();

// API endpoints
const REFRESH_TOKEN_API = `${BASE_URL}/user/refresh`;
const VALIDATE_TOKEN_API = `${BASE_URL}/user/user/protected`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth data from localStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedAccessToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');

      console.log('🔄 Initializing auth...', {
        hasUser: !!savedUser,
        hasAccessToken: !!savedAccessToken,
        hasRefreshToken: !!savedRefreshToken
      });

      if (savedUser && savedAccessToken) {
        setUser(JSON.parse(savedUser));
        setAccessToken(savedAccessToken);
        if (savedRefreshToken) {
          setRefreshToken(savedRefreshToken);
        }

        // Validate token on app start
        await validateToken(savedAccessToken);
      } else {
        console.log('🔐 No saved tokens found, setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Token validation function
  const validateToken = async (token) => {
    try {
      console.log('🔍 Validating token...');
      const response = await fetch(VALIDATE_TOKEN_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('✅ Token is valid');
        setLoading(false);
        return true;
      } else {
        console.log('❌ Token validation failed, status:', response.status);
        return false; // ✅ Return false instead of throwing
      }
    } catch (error) {
      console.log('❌ Token validation error:', error);
      return false; // ✅ Return false instead of auto-refreshing
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    try {
      const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');

      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');
      const response = await fetch(REFRESH_TOKEN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: currentRefreshToken
        })
      });

      // ✅ Handle expired/invalid refresh token
      if (!response.ok) {
        if (response.status === 401 || response.status === 422) {
          console.log('❌ Refresh token also expired/invalid');
          logout();
          return null;
        }
        throw new Error('Refresh token failed');
      }

      const data = await response.json();
      console.log('🔍 Refresh token response:', data);

      const newAccessToken = data.access_token;

      if (newAccessToken) {
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        console.log('✅ Access token refreshed successfully');
        return newAccessToken;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error('❌ Refresh token failed:', error);
      logout();
      return null;
    }
  };

  // Enhanced login function that stores tokens
  const login = (userData, tokens = {}) => {
    console.log('🔐 Logging in user:', userData);
    console.log('🔐 Tokens received:', tokens);

    setUser(userData);

    // Store tokens if provided
    if (tokens.accessToken) {
      setAccessToken(tokens.accessToken);
      localStorage.setItem('accessToken', tokens.accessToken);
    }
    if (tokens.refreshToken) {
      setRefreshToken(tokens.refreshToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }

    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuthModal(false);
    setLoading(false);
  };

  const logout = () => {
    console.log('🔐 Logging out user');
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setLoading(false);

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Enhanced fetch with automatic token refresh
  const authFetch = async (url, options = {}) => {
    console.log('🔥 authFetch called:', url);

    let token = accessToken || localStorage.getItem('accessToken');
    console.log('🔑 Access token being used:', token);

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

      console.log('📩 First response status:', response.status);

      // ✅ HANDLE BOTH 401 AND 422 TOKEN ERRORS
      if (response.status === 401 || response.status === 422) {
        const errorText = await response.text();
        console.log('🔄 Token issue detected:', { status: response.status, errorText });
        
        // ✅ Check if it's actually a token-related error
        if (response.status === 401 || 
            errorText.includes('Signature verification failed') || 
            errorText.includes('Token expired') ||
            errorText.includes('Not enough segments')) {
          
          console.log('🔄 Token invalid/expired - attempting refresh...');
          const newToken = await refreshAccessToken();
          if (newToken) {
            // Retry the request with new token
            headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...options,
              headers,
            });
          } else {
            logout();
            throw new Error('Authentication failed');
          }
        }
      }

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ authFetch failed:', response.status, text);
        throw new Error(`Failed to fetch: ${response.status} ${text}`);
      }

      return response;
    } catch (err) {
      console.error('🔥 authFetch error:', err);
      throw err;
    }
  };

  const openAuthModal = () => {
    console.log('🔐 Opening auth modal');
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    console.log('🔐 Closing auth modal');
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

  console.log('🔄 AuthProvider rendering, loading:', loading, 'user:', user);

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