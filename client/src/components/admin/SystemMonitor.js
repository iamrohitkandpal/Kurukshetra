import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemMonitor = () => {
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskSpace: 0,
    activeUsers: 0,
    failedLogins: 0
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSystemStats();
    fetchLogs();
  }, []);

  const fetchSystemStats = async () => {
    try {
      // A05: Endpoint reveals sensitive system information
      const res = await axios.get('/api/admin/system/stats');
      setSystemStats(res.data);
    } catch (err) {
      setError('Failed to load system statistics');
    }
  };

  const fetchLogs = async () => {
    try {
      // A09: Logs contain sensitive information
      const res = await axios.get('/api/admin/logs');
      setLogs(res.data);
    } catch (err) {
      setError('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      // A01: No proper authorization check in API
      await axios.delete('/api/admin/logs');
      setLogs([]);
      setSuccess('Logs cleared successfully');
    } catch (err) {
      setError('Failed to clear logs');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="row">
      <div className="col-md-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h3>System Monitor</h3>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <h5 className="card-title">CPU Usage</h5>
                    <h2>{systemStats.cpuUsage}%</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <h5 className="card-title">Memory Usage</h5>
                    <h2>{systemStats.memoryUsage}%</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card bg-warning text-white">
                  <div className="card-body">
                    <h5 className="card-title">Active Users</h5>
                    <h2>{systemStats.activeUsers}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4>System Logs</h4>
              <div className="d-flex justify-content-end mb-2">
                <button className="btn btn-danger" onClick={clearLogs}>
                  Clear Logs
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Level</th>
                      <th>Message</th>
                      <th>User</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`badge bg-${log.level === 'error' ? 'danger' : 'info'}`}>
                            {log.level}
                          </span>
                        </td>
                        <td>{log.message}</td>
                        <td>{log.user}</td>
                        <td>{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;