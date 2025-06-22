import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { isAdmin } from '../../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import SystemMonitor from './SystemMonitor';
import Toast from '../common/Toast';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [systemInfo, setSystemInfo] = useState('');
  const [command, setCommand] = useState('uname -a');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [commandLoading, setCommandLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const executeCommand = async () => {
    setCommandLoading(true);
    try {
      const res = await axios.post('/api/admin/system-info', { command });
      setSystemInfo(res.data.output);
      if (res.data.output) {
        showToast('Command executed successfully', 'success');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Command execution failed';
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setCommandLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete user';
      showToast(errorMessage, 'error');
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading admin data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4 text-light">Admin Control Panel</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="row g-4">
        {/* System Command Section */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100 bg-dark text-light">
            <div className="card-header bg-secondary border-0">
              <h5 className="mb-0">System Command Execution</h5>
            </div>
            <div className="card-body">
              <label className="form-label">Command</label>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control font-monospace"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g. uname -a"
                />
                <button 
                  className="btn btn-outline-info" 
                  onClick={executeCommand}
                  disabled={commandLoading}
                >
                  {commandLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Executing...
                    </>
                  ) : (
                    'Run'
                  )}
                </button>
              </div>
              {systemInfo && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Output:</span>
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => navigator.clipboard.writeText(systemInfo)}
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="system-output p-3 rounded overflow-auto">
                    {systemInfo}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-secondary text-white border-0">
              <h5 className="mb-0">User Management</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead className="table-light sticky-top table-header-sticky">
                    <tr>
                      <th className="px-4">Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th className="text-end px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4">
                          <div className="d-flex align-items-center">
                            <div className="avatar-text me-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            {user.username}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="text-end px-4">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* System Monitor Section */}
        <div className="col-12">
          <SystemMonitor />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
