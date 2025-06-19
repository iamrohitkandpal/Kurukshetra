import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container py-5">
      <h1 className="display-4 text-center app-title mb-4">Welcome to Kurukshetra</h1>
      <p className="lead text-center">
        An intentionally vulnerable web application for cybersecurity training and education
      </p>

      <div className="alert alert-danger mt-4" role="alert">
        <h4 className="alert-heading">⚠️ Security Warning</h4>
        <p className="fw-bold">
          This application contains intentional security vulnerabilities for educational purposes. DO NOT:
        </p>
        <ul>
          <li>Use real credentials or sensitive information</li>
          <li>Deploy to production environments</li>
          <li>Expose this application to the internet</li>
        </ul>
        <hr />
        <p className="mb-0 fw-bold">
          Never deploy this application to production environments or expose it to the internet.
        </p>
      </div>

      <div className="card glass-card mt-5 p-4">
        <h5 className="mb-3">OWASP Top 10 (2021) Vulnerabilities:</h5>
        <div className="row">
          <div className="col-md-6">
            <ul className="list-group">
              <li className="list-group-item">A01:2021 - Broken Access Control</li>
              <li className="list-group-item">A02:2021 - Cryptographic Failures</li>
              <li className="list-group-item">A03:2021 - Injection</li>
              <li className="list-group-item">A04:2021 - Insecure Design</li>
              <li className="list-group-item">A05:2021 - Security Misconfiguration</li>
            </ul>
          </div>
          <div className="col-md-6">
            <ul className="list-group">
              <li className="list-group-item">A06:2021 - Vulnerable Components</li>
              <li className="list-group-item">A07:2021 - Auth & Identity Failures</li>
              <li className="list-group-item">A08:2021 - Software & Data Integrity Failures</li>
              <li className="list-group-item">A09:2021 - Security Logging/Monitoring Failures</li>
              <li className="list-group-item">A10:2021 - Server-Side Request Forgery</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <Link to="/register" className="btn btn-primary mx-2 primary-button">
          Register
        </Link>
        <Link to="/login" className="btn btn-outline-primary mx-2">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Landing;
