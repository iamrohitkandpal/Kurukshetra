// client/src/components/common/DatabaseSelector.js
import React, { useState, useContext, useEffect } from 'react';
import { DatabaseContext } from '../../context/DatabaseContext';
import axios from 'axios';

const DatabaseSelector = () => {
  const { dbType, setDbType } = useContext(DatabaseContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [message, setMessage] = useState('');
  
  // Fetch initial vulnerabilities on component mount
  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const res = await axios.get(`/api/db/vulnerabilities?type=${dbType}`);
        setVulnerabilities(res.data.vulnerabilities || []);
      } catch (err) {
        console.error("Failed to fetch vulnerabilities:", err);
      }
    };
    
    fetchVulnerabilities();
  }, [dbType]);

  const handleDatabaseSwitch = async (newType) => {
    if (newType === dbType) return; // Prevent unnecessary API calls
    
    setLoading(true);
    setError('');
    setMessage(`Switching to ${newType === 'mongodb' ? 'MongoDB' : 'SQLite'}...`);
    setShowSnackbar(true);

    try {
      const res = await axios.post('/api/db/switch', { type: newType });
      
      if (res.data.success) {
        setDbType(newType);
        setVulnerabilities(res.data.vulnerabilities || []);
        
        // Update axios default params
        axios.defaults.params = { ...axios.defaults.params, db: newType };
        
        setMessage(`Successfully switched to ${newType === 'mongodb' ? 'MongoDB 🍃' : 'SQLite 🗃️'}`);
        
        // Hide snackbar after 3 seconds
        setTimeout(() => setShowSnackbar(false), 3000);
      } else {
        throw new Error(res.data.error || 'Failed to switch database');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to switch database');
      setShowSnackbar(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="database-selector card mb-4">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Database Selection</h5>
          {loading && <div className="spinner-border spinner-border-sm text-light" role="status" />}
        </div>
        
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="btn-group w-100" role="group">
            <button
              className={`btn ${dbType === 'sqlite' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleDatabaseSwitch('sqlite')}
              disabled={loading || dbType === 'sqlite'}
            >
              SQLite
              <small className="d-block">SQL Injection Demo</small>
            </button>
            
            <button
              className={`btn ${dbType === 'mongodb' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => handleDatabaseSwitch('mongodb')}
              disabled={loading || dbType === 'mongodb'}
            >
              MongoDB
              <small className="d-block">NoSQL Injection Demo</small>
            </button>
          </div>

          {vulnerabilities.length > 0 && (
            <div className="mt-3">
              <h6>Available Vulnerabilities:</h6>
              <ul className="list-group">
                {vulnerabilities.map((vuln, i) => (
                  <li key={i} className="list-group-item">
                    <span className="badge bg-danger me-2">Demo</span>
                    {vuln}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {showSnackbar && (
        <div className="toast-notification">
          {loading ? (
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              {message}
            </div>
          ) : (
            <div>✅ {message}</div>
          )}
        </div>
      )}
    </>
  );
};

export default DatabaseSelector;