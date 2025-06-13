import React, { useState } from 'react';
import axios from 'axios';

const UpdateManager = () => {
  const [updateUrl, setUpdateUrl] = useState('');
  const [status, setStatus] = useState('');

  const checkForUpdates = async () => {
    try {
      // A10: SSRF vulnerability
      const res = await axios.post('/api/updates/check', { updateUrl });
      setStatus(res.data);
    } catch (err) {
      setStatus('Update check failed');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Update Manager</h3>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Update Server URL</label>
          <input
            type="text"
            className="form-control"
            value={updateUrl}
            onChange={(e) => setUpdateUrl(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={checkForUpdates}>
          Check for Updates
        </button>
        {status && (
          <div className="mt-3">
            <pre>{JSON.stringify(status, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateManager;