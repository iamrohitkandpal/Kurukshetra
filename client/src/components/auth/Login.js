import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const { username, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // A03: SQL Injection vulnerability exists in backend
      const res = await axios.post('/api/auth/login', { username, password });
      
      // Set auth token
      setToken(res.data.token);
      
      // Set user info
      setUser({
        userId: res.data.user.id,
        username: res.data.user.username,
        role: res.data.user.role
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // A07:2021 - Identification and Authentication Failures
  // Vulnerable function - No rate limiting, weak password policy
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // A03:2021 - Injection Vulnerability
      // Direct string interpolation leading to SQL injection
      const response = await axios.post('/api/auth/login', 
        `username=${formData.username}&password=${formData.password}`,
        {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
      );

      // A02:2021 - Cryptographic Failures
      // Insecure token storage in localStorage
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      
      // A07:2021 - Client-side user role parsing
      const payload = JSON.parse(atob(response.data.token.split('.')[1]));
      setUser({
        userId: payload.id,
        username: payload.username,
        role: payload.role
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="row">
      <div className="col-md-6 offset-md-3">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="text-center mb-4">Login</h2>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={username}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="mt-3 text-center">
              <p>
                Don't have an account? <Link to="/register">Register</Link>
              </p>
              <p>
                <Link to="/reset-password">Forgot password?</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
