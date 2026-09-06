import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage on app load
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would validate the token with the backend
      // For now, we'll set a mock user
      setUser({
        id: 1,
        name: 'Officer Rajesh Kumar',
        email: 'rajesh.kumar@police.gov.in',
        badge: 'PS5042',
        rank: 'Inspector',
        zone: 'Central Zone'
      });
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    // In a real app, you would make an API call to login
    // For now, we'll simulate a successful login
    const token = 'mock-token-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('token', token);
    setUser({
      id: 1,
      name: credentials.username || 'Officer Rajesh Kumar',
      email: credentials.email || 'rajesh.kumar@police.gov.in',
      badge: 'PS5042',
      rank: 'Inspector',
      zone: 'Central Zone'
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};