import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// Error boundary
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { DatabaseProvider } from "./context/DatabaseContext";

// Routing protection
import PrivateRoute from "./components/auth/PrivateRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ROLES } from "./utils/authUtils";

// Lazy-loaded components
const Landing = React.lazy(() => import("./components/layout/Landing"));
const Unauthorized = React.lazy(() => import("./components/auth/Unauthorized"));
const Login = React.lazy(() => import("./components/auth/Login"));
const Register = React.lazy(() => import("./components/auth/Register"));
const PasswordReset = React.lazy(() => import("./components/auth/PasswordReset"));
const Dashboard = React.lazy(() => import("./components/dashboard/Dashboard"));
const AdminPanel = React.lazy(() => import("./components/admin/AdminPanel"));
const ProductList = React.lazy(() => import("./components/products/ProductList"));
const ProductDetails = React.lazy(() => import("./components/products/ProductDetails"));
const ProfilePage = React.lazy(() => import("./components/profile/ProfilePage"));
const FeedbackForm = React.lazy(() => import("./components/feedback/FeedbackForm"));
const NotFound = React.lazy(() => import("./components/layout/NotFound"));
import Layout from "./components/layout/Layout";

// Axios global config
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

// Fallback loading component
const LoadingFallback = () => (
  <div className="loading-screen d-flex justify-content-center align-items-center min-vh-100">
    <div className="text-center">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Loading application...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error }) => (
  <div className="error-screen d-flex justify-content-center align-items-center min-vh-100">
    <div className="text-center">
      <h2>Something went wrong</h2>
      <pre className="text-danger">{error?.message}</pre>
      <button 
        className="btn btn-primary mt-3"
        onClick={() => window.location.reload()}
      >
        Reload Application
      </button>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <DatabaseProvider>
          <Router>
            <Layout>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<PasswordReset />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Dashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                      <ErrorBoundary>
                        <AdminPanel />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/products" element={
                    <ErrorBoundary>
                      <ProductList />
                    </ErrorBoundary>
                  } />
                  <Route path="/products/:id" element={
                    <ErrorBoundary>
                      <ProductDetails />
                    </ErrorBoundary>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <ProfilePage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } />
                  <Route path="/feedback" element={
                    <ErrorBoundary>
                      <FeedbackForm />
                    </ErrorBoundary>
                  } />
                  {/* Global fallback route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </DatabaseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
