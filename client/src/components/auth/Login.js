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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { username, password });
      
      if (!res.data || !res.data.token) {
        throw new Error('Invalid server response');
      }
      
      setToken(res.data.token);
      
      setUser({
        userId: res.data.user.id,
        username: res.data.user.username,
        role: res.data.user.role
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 
               err.response?.data?.message || 
               err.message || 
               'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row mt-5">
      <div className="col-md-6 offset-md-3">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="text-center mb-4">Login</h2>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
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
                <small className="text-muted">Try: admin&apos; OR &apos;1&apos;=&apos;1</small>
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
                Don&apos;t have an account? <Link to="/register">Register</Link>
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
