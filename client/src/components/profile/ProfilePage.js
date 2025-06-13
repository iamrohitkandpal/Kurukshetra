import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import TwoFactorSetup from './TwoFactorSetup';
import ApiKeyManagement from './ApiKeyManagement';
import SecurityQuestions from './SecurityQuestions';
import SensitiveDataManager from './SensitiveDataManager';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    email: '',
    apiKey: '',
    mfaEnabled: false,
    securityQuestions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/users/profile');
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', { email: profile.email });
      setSuccess('Email updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2 className="mb-4">Profile Settings</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h3>Basic Information</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleEmailUpdate}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.username}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Update Email
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <TwoFactorSetup mfaEnabled={profile.mfaEnabled} />
        </div>

        <div className="col-md-6">
          <ApiKeyManagement apiKey={profile.apiKey} />
        </div>

        <div className="col-md-6">
          <SecurityQuestions questions={profile.securityQuestions} />
        </div>

        <div className="col-md-12">
          <SensitiveDataManager />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;