import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// Error boundary
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { DatabaseProvider } from "./context/DatabaseContext";

// Routing protection
import { PrivateRoute } from "./components/auth/PrivateRoute";
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
const FileUpload = React.lazy(() => import("./components/files/FileUpload"));
const FileList = React.lazy(() => import("./components/files/FileList"));
const FeedbackForm = React.lazy(() => import("./components/feedback/FeedbackForm"));
const NotFound = React.lazy(() => import("./components/layout/NotFound"));
import Layout from "./components/layout/Layout";

// Axios global config
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DatabaseProvider>
          <Router>
            <Layout>
              <Suspense fallback={<div className="loading-screen">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<PasswordReset />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminPanel /></ProtectedRoute>} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                  <Route path="/upload" element={<PrivateRoute><FileUpload /></PrivateRoute>} />
                  <Route path="/files" element={<PrivateRoute><FileList /></PrivateRoute>} />
                  <Route path="/feedback" element={<FeedbackForm />} />
                  {/* Make sure this is the last route */}
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
