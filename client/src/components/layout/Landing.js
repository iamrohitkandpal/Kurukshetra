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
      <h1 className="display-4 text-center">Welcome to Kurukshetra</h1>
      <p className="lead text-center">
        An intentionally vulnerable web application for cybersecurity training and education
      </p>

      <div className="alert alert-danger mt-4" role="alert">
        <h4 className="alert-heading">⚠️ Security Warning</h4>
        <p>
          This application contains intentional security vulnerabilities for educational purposes. DO NOT:
        </p>
        <ul>
          <li>Use real credentials or sensitive information</li>
          <li>Deploy to production environments</li>
          <li>Expose this application to the internet</li>
        </ul>
        <hr />
        <p className="mb-0">
          Never deploy this application to production environments or expose it to the internet.
        </p>
      </div>

      <div className="mt-4">
        <h5>Available Vulnerabilities:</h5>
        <ul>
          <li>A01:2021 - Broken Access Control</li>
          <li>A02:2021 - Cryptographic Failures</li>
          <li>A03:2021 - Injection</li>
          <li>A04:2021 - Insecure Design</li>
          <li>A05:2021 - Security Misconfiguration</li>
          <li>A06:2021 - Vulnerable Components</li>
          <li>A07:2021 - Auth & Identity Failures</li>
          <li>A08:2021 - Software & Data Integrity Failures</li>
          <li>A09:2021 - Security Logging/Monitoring Failures</li>
          <li>A10:2021 - Server-Side Request Forgery</li>
        </ul>
      </div>

      <div className="text-center mt-4">
        <Link to="/register" className="btn btn-primary mx-2">
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
