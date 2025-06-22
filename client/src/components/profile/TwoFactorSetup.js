import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const TwoFactorSetup = ({ mfaEnabled = false }) => {
  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getMFAStatus = async () => {
      try {
        const res = await axios.get('/api/profile/mfa-status');
        setEnabled(res.data.enabled);
      } catch (err) {
        setMessage('Error fetching MFA status');
      }
    };
    getMFAStatus();
  }, []);

  const initiateSetup = async () => {
    try {
      const res = await axios.post('/api/mfa/setup');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setSetupMode(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    }
  };

  const verifyAndEnable = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/mfa/verify', { token });
      setSuccess('2FA enabled successfully');
      setSetupMode(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  const disable2FA = async () => {
    try {
      await axios.post('/api/mfa/disable');
      setSuccess('2FA disabled successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable 2FA');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Two-Factor Authentication</h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {message && <div className="alert alert-info mt-3">{message}</div>}

        {!mfaEnabled && !setupMode && (
          <button className="btn btn-primary" onClick={initiateSetup}>
            Setup 2FA
          </button>
        )}

        {setupMode && (
          <div>
            <p>Scan this QR code with your authenticator app:</p>
            <img src={qrCode} alt="2FA QR Code" className="mb-3" />
            <p>Or enter this code manually: <code>{secret}</code></p>
            
            <form onSubmit={verifyAndEnable}>
              <div className="mb-3">
                <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  className="form-control"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Verify and Enable
              </button>
            </form>
          </div>
        )}

        {mfaEnabled && (
          <div>
            <p className="text-success">2FA is enabled</p>
            <button className="btn btn-danger" onClick={disable2FA}>
              Disable 2FA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

TwoFactorSetup.propTypes = {
  mfaEnabled: PropTypes.bool
};

export default TwoFactorSetup;