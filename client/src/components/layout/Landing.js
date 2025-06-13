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
      <div className="row">
        <div className="col-md-8 offset-md-2 text-center">
          <h1 className="display-4">Welcome to Kurukshetra</h1>
          <p className="lead">
            An intentionally vulnerable web application for cybersecurity training and education
          </p>
          
          <div className="alert alert-danger my-4">
            <h4 className="alert-heading">⚠️ Security Warning</h4>
            <p>
              This application contains intentional security vulnerabilities for educational purposes. 
              <strong> DO NOT</strong> use real credentials or sensitive information while using this app.
            </p>
            <p className="mb-0">
              Never deploy this application to production environments or expose it to the internet.
            </p>
          </div>
          
          <p className="my-4">
            Kurukshetra implements vulnerabilities from the OWASP Top 10 (2021) with multiple difficulty levels.
            Use it to practice penetration testing techniques in a safe environment.
          </p>
          
          <div className="d-grid gap-2 d-md-block">
            <Link to="/register" className="btn btn-primary me-md-2">Register</Link>
            <Link to="/login" className="btn btn-light ms-2">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
