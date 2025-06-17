import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './styles/theme.css';

// Components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import ProductList from './components/products/ProductList';
import ProductDetails from './components/products/ProductDetails';
import ProfilePage from './components/profile/ProfilePage';
import FileUpload from './components/files/FileUpload';
import FileList from './components/files/FileList';
import FeedbackForm from './components/feedback/FeedbackForm';
import NotFound from './components/layout/NotFound';
import PasswordReset from './components/auth/PasswordReset'; // Import the PasswordReset component

// Context
import AuthContext from './context/AuthContext';

// Update axios config with proper error handling
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://kurukshetra-server.onrender.com';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000;

// Add request interceptor for auth header
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add better error handling for axios
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token on auth error
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
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

  // Auth routes - check if user is logged in
  const PrivateRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
  };

  // Admin routes - check if user is admin
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      <Router basename={process.env.PUBLIC_URL}>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Landing />} exact />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/upload" element={<PrivateRoute><FileUpload /></PrivateRoute>} />
            <Route path="/files" element={<PrivateRoute><FileList /></PrivateRoute>} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/reset-password" element={<PasswordReset />} /> {/* Add the PasswordReset route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
