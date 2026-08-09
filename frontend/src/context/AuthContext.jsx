import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('parkx_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 1,
      full_name: 'Alex Mercer',
      email: 'alex.driver@parkx.io',
      phone: '+1 555-0199',
      role: 'DRIVER',
      is_verified: true
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('parkx_token') || 'demo-jwt-token-12345');

  useEffect(() => {
    if (user) {
      localStorage.setItem('parkx_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('parkx_user');
    }
  }, [user]);

  const login = async (email, password, selectedRole = 'DRIVER') => {
    try {
      // Try backend endpoint
      const res = await fetch('http://localhost:8080/user', { method: 'GET' });
      if (res.ok) {
        const users = await res.json();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          setUser(found);
          setToken('backend-token-' + found.id);
          return { success: true, user: found };
        }
      }
    } catch (err) {
      console.warn('Backend offline or unreachable, using local auth mock', err);
    }

    // Demo authentication fallback
    const mockUser = {
      id: selectedRole === 'ADMIN' ? 2 : 1,
      full_name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'User',
      email: email,
      phone: '+1 555-4321',
      role: selectedRole,
      is_verified: true
    };
    setUser(mockUser);
    setToken('demo-token-' + Date.now());
    return { success: true, user: mockUser };
  };

  const signup = async (userData) => {
    try {
      const res = await fetch('http://localhost:8080/create_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const newUser = await res.json();
        setUser(newUser);
        return { success: true, user: newUser };
      }
    } catch (err) {
      console.warn('Backend create_user failed, storing locally', err);
    }

    const newUser = {
      id: Math.floor(Math.random() * 1000) + 10,
      full_name: userData.full_name || 'New Driver',
      email: userData.email,
      phone: userData.phone || '+1 555-0000',
      role: userData.role || 'DRIVER',
      is_verified: true
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('parkx_user');
    localStorage.removeItem('parkx_token');
  };

  const switchRole = (newRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role || 'DRIVER', login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
