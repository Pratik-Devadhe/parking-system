import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('parkx_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('parkx_token') || null);

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

  const login = async (email, password, selectedRole = 'DRIVER') => {
    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const authenticatedUser = data.user;
          setUser(authenticatedUser);
          const userToken = data.token || 'backend-token-' + data.user.id;
          setToken(userToken);
          return { success: true, user: authenticatedUser, token: userToken };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.message || errData.error || 'Invalid email or password.' };
      }
    } catch (err) {
      console.warn('Backend server unreachable, checking client auth fallback credentials', err);
    }

    // Role-aligned authentication fallback for offline/demo mode
    const demoAccounts = [
      { email: 'alex.driver@parkx.io', pass: 'driver123', role: 'DRIVER', id: 1, full_name: 'Alex Mercer', phone: '+1 555-0199' },
      { email: 'david.owner@parkx.io', pass: 'owner123', role: 'OWNER', id: 3, full_name: 'David Miller', phone: '+1 555-3344' },
      { email: 'admin.system@parkx.io', pass: 'admin123', role: 'ADMIN', id: 2, full_name: 'Samantha Vance', phone: '+1 555-9000' }
    ];

    const matchedAccount = demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (matchedAccount) {
      if (matchedAccount.pass !== password) {
        return { success: false, error: 'Invalid email or password.' };
      }
      if (selectedRole && matchedAccount.role !== selectedRole) {
        return { success: false, error: `Role mismatch: This account is registered as ${matchedAccount.role}, not ${selectedRole}.` };
      }

      const mockUser = {
        id: matchedAccount.id,
        full_name: matchedAccount.full_name,
        email: matchedAccount.email,
        phone: matchedAccount.phone,
        role: matchedAccount.role,
        is_verified: true,
        status: 'ACTIVE'
      };
      const demoToken = `demo-token-${matchedAccount.role.toLowerCase()}-${Date.now()}`;
      setUser(mockUser);
      setToken(demoToken);
      return { success: true, user: mockUser, token: demoToken };
    }

    // Generic fallback for custom users created offline
    if (email && password) {
      const mockUser = {
        id: Math.floor(Math.random() * 1000) + 10,
        full_name: email.split('@')[0].replace(/[\._]/g, ' ').toUpperCase() || 'User',
        email: email,
        phone: '+1 555-0199',
        role: selectedRole === 'ADMIN' ? 'DRIVER' : selectedRole,
        is_verified: true,
        status: 'ACTIVE'
      };
      const demoToken = `demo-token-${mockUser.role.toLowerCase()}-${Date.now()}`;
      setUser(mockUser);
      setToken(demoToken);
      return { success: true, user: mockUser, token: demoToken };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const signup = async (userData) => {
    const role = (userData.role || 'DRIVER').toUpperCase();
    if (role === 'ADMIN') {
      return { success: false, error: 'Registration as ADMIN is not allowed. System Administrator is a restricted single account.' };
    }

    try {
      const res = await fetch('http://localhost:8080/create_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, role })
      });
      if (res.ok) {
        const data = await res.json();
        const createdUser = data.user || data;
        setUser(createdUser);
        const newToken = data.token || 'backend-token-' + createdUser.id;
        setToken(newToken);
        return { success: true, user: createdUser, token: newToken };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.message || errData.error || 'Failed to create account.' };
      }
    } catch (err) {
      console.warn('Backend create_user offline, completing local signup', err);
    }

    const newUser = {
      id: Math.floor(Math.random() * 1000) + 10,
      full_name: userData.full_name || 'New User',
      email: userData.email,
      phone: userData.phone || '+1 555-0000',
      role: role === 'ADMIN' ? 'DRIVER' : role,
      is_verified: role !== 'OWNER',
      status: 'ACTIVE'
    };
    const newToken = `demo-token-${newUser.role.toLowerCase()}-${Date.now()}`;
    setUser(newUser);
    setToken(newToken);
    return { success: true, user: newUser, token: newToken };
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

