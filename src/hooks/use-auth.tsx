// src/hooks/use-auth.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  username: string;
  email: string;
  flagsFound: string[];
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced token management
const TOKEN_KEY = 'authToken';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

// Helper functions for secure token storage
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to access localStorage:', error);
    return null;
  }
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    console.log('🚪 Logging out user...');
    removeStoredToken();
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear any other auth-related storage
      sessionStorage.clear();
    }
  }, []);

  const validateAndDecodeToken = useCallback((token: string) => {
    try {
      const decoded: { id: string; exp: number; email: string; username: string } = jwtDecode(token);
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.log('Token expired, removing...');
        return null;
      }
      
      // Check if token will expire soon (for refresh logic)
      const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
      if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
        console.log('Token expiring soon, consider refresh');
      }
      
      return decoded;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const token = getStoredToken();
    
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    const decoded = validateAndDecodeToken(token);
    if (!decoded) {
      logout();
      setLoading(false);
      return;
    }
    
    try {
      // Fetch fresh user data from API
      const response = await fetch(`/api/users/${decoded.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token rejected by server, logging out...');
          logout();
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ User authenticated:', userData.username);
      
    } catch (error) {
      console.error('❌ Failed to fetch user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, validateAndDecodeToken]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      if (result.token) {
        setStoredToken(result.token);
        
        // Immediately set user data from login response
        if (result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
        
        // Fetch fresh user data to ensure consistency
        await fetchUser();
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  const refetchUser = useCallback(() => {
    setLoading(true);
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refetchUser, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
