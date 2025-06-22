import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const requestReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { email });
      setSuccess('Password reset instructions sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset');
    }
  };

  const confirmReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password/confirm', {
        token,
        newPassword
      });
      setSuccess('Password reset successful');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Reset Password</h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {step === 1 && (
                <form onSubmit={requestReset}>
                  <div className="mb-3">
                    <label htmlFor="resetEmail" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="resetEmail"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Request Password Reset
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={confirmReset}>
                  <div className="mb-3">
                    <label htmlFor="resetToken" className="form-label">Reset Token</label>
                    <input
                      type="text"
                      id="resetToken"
                      className="form-control"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Reset Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;