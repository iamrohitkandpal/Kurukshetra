import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import WebhookManager from '../webhooks/WebhookManager';
import VulnerabilityProgress from '../progress/VulnerabilityProgress';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (!user?.userId) return;
        
        // A01: IDOR vulnerability in the API
        const res = await axios.get(`/api/progress/summary/${user.userId}`);
        setProgress(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to load progress data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2>Welcome, {user?.username || 'User'}!</h2>
              <p className="lead">Role: <span className="badge bg-info">{user?.role || 'user'}</span></p>
              <p>This is your personal dashboard where you can track your progress and access various features.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header">
              <h3>Vulnerability Progress</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              {progress && progress.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Completed</th>
                        <th>Total</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress.map((category) => (
                        <tr key={category.category}>
                          <td>{category.category}</td>
                          <td>{category.completed}</td>
                          <td>{category.total}</td>
                          <td>
                            <div className="progress">
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${(category.completed / category.total) * 100}%`
                                }}
                                aria-valuenow={category.completed}
                                aria-valuemin="0"
                                aria-valuemax={category.total}
                              >
                                {Math.round((category.completed / category.total) * 100)}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No progress data available. Start exploring vulnerabilities!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <VulnerabilityProgress />
        </div>
        <div className="col-md-12">
          <WebhookManager />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-4 mb-4">
          <div className="card h-100 feature-card">
            <div className="card-body">
              <h5 className="card-title">Products</h5>
              <p className="card-text">Browse our catalog of products with SQL Injection vulnerabilities.</p>
              <Link to="/products" className="btn btn-primary">View Products</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 feature-card">
            <div className="card-body">
              <h5 className="card-title">Files</h5>
              <p className="card-text">Upload and manage your files with path traversal vulnerabilities.</p>
              <Link to="/files" className="btn btn-primary">My Files</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 feature-card">
            <div className="card-body">
              <h5 className="card-title">Feedback</h5>
              <p className="card-text">Leave your feedback with XSS vulnerabilities.</p>
              <Link to="/feedback" className="btn btn-primary">Submit Feedback</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
