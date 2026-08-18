import React, { createContext, useContext, useState, useEffect } from 'react';
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    console.error("CRITICAL CONFIGURATION ERROR: VITE_API_URL environment variable is missing!");
    throw new Error("VITE_API_URL environment variable is not configured.");
  }
  return url.replace(/\/+$/, '');
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('parkx_token');
    if (savedToken && (savedToken.startsWith('demo-token-') || savedToken.startsWith('backend-token-'))) {
      localStorage.removeItem('parkx_token');
      localStorage.removeItem('parkx_user');
      return null;
    }
    return savedToken || null;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('parkx_token');
    if (!savedToken) {
      localStorage.removeItem('parkx_user');
      return null;
    }
    const savedUser = localStorage.getItem('parkx_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('parkx_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('parkx_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('parkx_token', token);
    } else {
      localStorage.removeItem('parkx_token');
    }
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('parkx:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('parkx:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password, selectedRole = 'DRIVER') => {
    try {
      const res = await fetch(`${getApiUrl()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.token) {
          setUser(data.user);
          setToken(data.token);
          return { success: true, user: data.user, token: data.token };
        }
        return { success: false, error: 'Invalid response from authentication server.' };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.message || errData.error || 'Invalid email or password.' };
      }
    } catch (err) {
      console.error('Login request failed:', err);
      return { success: false, error: 'Unable to connect to authentication server. Please check your network connection.' };
    }
  };

  const signup = async (userData) => {
    const role = (userData.role || 'DRIVER').toUpperCase();
    if (role === 'ADMIN') {
      return { success: false, error: 'Registration as ADMIN is not allowed. System Administrator is a restricted single account.' };
    }

    try {
      const res = await fetch(`${getApiUrl()}/create_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, role })
      });
      if (res.ok) {
        const data = await res.json();
        const createdUser = data.user || data;
        const newToken = data.token;
        if (createdUser) {
          setUser(createdUser);
          if (newToken) setToken(newToken);
          return { success: true, user: createdUser, token: newToken };
        }
        return { success: false, error: 'Failed to create user session.' };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.message || errData.error || 'Failed to create account.' };
      }
    } catch (err) {
      console.error('Signup request failed:', err);
      return { success: false, error: 'Unable to connect to server. Please check your network connection.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('parkx_user');
    localStorage.removeItem('parkx_token');
  };

  const switchRole = (newRole) => {
    if (user) {
      // Authorization Check for Role Switcher
      if (user.role === 'DRIVER' && newRole !== 'DRIVER') {
        alert('Access Denied: DRIVER accounts cannot switch to OWNER or ADMIN portal privileges.');
        return;
      }
      if (user.role === 'OWNER' && newRole === 'ADMIN') {
        alert('Access Denied: OWNER accounts cannot access ADMIN portal privileges.');
        return;
      }
      const updated = { ...user, role: newRole };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      role: user?.role || 'DRIVER', 
      isAuthenticated: !!user,
      login, 
      signup, 
      logout, 
      switchRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

