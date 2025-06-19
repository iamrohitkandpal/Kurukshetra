import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  setUser: () => {},
  setToken: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // A07: JWT stored in localStorage - vulnerable to XSS
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // A02, A07: No token verification, just parse it client-side
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (token) {
          // A07: Insecure token handling - No server verification
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            userId: payload.userId,
            username: payload.username,
            role: payload.role
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
