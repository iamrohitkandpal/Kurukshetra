import React, { Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Components
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
import PasswordReset from './components/auth/PasswordReset';
import Layout from './components/layout/Layout';

// Context
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';

// Lazy-loaded components
const Landing = React.lazy(() => import('./components/layout/Landing'));

// Set default axios baseURL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Custom hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth routes - check if user is logged in
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Admin routes - check if user is admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DatabaseProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Landing />
                  </Suspense>
                } />
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
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </DatabaseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
