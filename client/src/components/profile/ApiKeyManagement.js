import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const ApiKeyManagement = ({ apiKey: initialApiKey }) => {
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKey, setApiKey] = useState(initialApiKey);

  const generateNewKey = async () => {
    try {
      const res = await axios.post('/api/users/api-key');
      setApiKey(res.data.apiKey);
      setSuccess('New API key generated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate API key');
    }
  };

  const revokeKey = async () => {
    try {
      await axios.delete('/api/users/api-key');
      setApiKey(null);
      setSuccess('API key revoked');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revoke API key');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>API Key Management</h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {apiKey ? (
          <div>
            <div className="mb-3">
              <label className="form-label">Your API Key:</label>
              <div className="input-group">
                <input
                  type={showKey ? "text" : "password"}
                  className="form-control"
                  value={apiKey}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="btn-group">
              <button className="btn btn-warning" onClick={generateNewKey}>
                Generate New Key
              </button>
              <button className="btn btn-danger" onClick={revokeKey}>
                Revoke Key
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={generateNewKey}>
            Generate API Key
          </button>
        )}
      </div>
    </div>
  );
};

ApiKeyManagement.propTypes = {
  apiKey: PropTypes.string
};

export default ApiKeyManagement;