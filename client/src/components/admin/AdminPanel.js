import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SystemMonitor from './SystemMonitor';
import { ErrorBoundary } from '../common/ErrorBoundary';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [systemInfo, setSystemInfo] = useState('');
  const [command, setCommand] = useState('uname -a');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async () => {
    try {
      // A03: Command Injection vulnerability
      const res = await axios.get(`/api/admin/system-info?command=${command}`);
      setSystemInfo(res.data.output);
    } catch (err) {
      setError('Command execution failed');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ErrorBoundary>
      <div className="container">
        <h2>Admin Panel</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3>System Information</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Execute Command</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={executeCommand}
                    >
                      Execute
                    </button>
                  </div>
                </div>
                {systemInfo && (
                  <pre className="bg-light p-3 mt-3">
                    {systemInfo}
                  </pre>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3>User Management</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <SystemMonitor />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminPanel;