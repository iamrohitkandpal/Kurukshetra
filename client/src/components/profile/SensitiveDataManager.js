import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SensitiveDataManager = () => {
  const [personalData, setPersonalData] = useState({
    phoneNumber: '',
    ssn: '',
    dateOfBirth: '',
    address: '',
    bankAccount: '',
    nationalId: ''
  });
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPersonalData();
  }, []);
  const fetchPersonalData = async () => {
    try {
      // A02: API endpoint returns sensitive data without encryption
      const res = await axios.get('/api/users/personal-data');
      setPersonalData(res.data);
      // Assuming the API returns user ID or we can get it from localStorage
      setUserId(res.data.userId || localStorage.getItem('userId') || '');
    } catch (err) {
      setError('Failed to load personal data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // A02: Sending sensitive data without encryption
      await axios.put('/api/users/personal-data', personalData);
      setSuccess('Personal data updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };
  
  // Function to export data
  const exportData = () => {
    // A02: Sensitive data exposure
    const dataToExport = {
      ...personalData,
      exportedAt: new Date().toISOString(),
      userId: userId
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personal-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Sensitive Information</h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="form-control"
                  value={personalData.phoneNumber}
                  onChange={(e) => setPersonalData({...personalData, phoneNumber: e.target.value})}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="ssn" className="form-label">SSN</label>
                <input
                  type="text"
                  id="ssn"
                  className="form-control"
                  value={personalData.ssn}
                  onChange={(e) => setPersonalData({...personalData, ssn: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="dob" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  className="form-control"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  id="address"
                  className="form-control"
                  value={personalData.address}
                  onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="bankAccount" className="form-label">Bank Account</label>
                <input
                  type="text"
                  id="bankAccount"
                  className="form-control"
                  value={personalData.bankAccount}
                  onChange={(e) => setPersonalData({...personalData, bankAccount: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="nationalId" className="form-label">National ID</label>
                <input
                  type="text"
                  id="nationalId"
                  className="form-control"
                  value={personalData.nationalId}
                  onChange={(e) => setPersonalData({...personalData, nationalId: e.target.value})}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Update Personal Data</button>
          <button 
            type="button"
            onClick={exportData} 
            className="btn btn-secondary ms-2"
          >
            Export Data
          </button>
        </form>

        <div className="alert alert-warning mt-3">
          <h4 className="alert-heading">Security Notice</h4>
          <p>This information is stored and transmitted in plain text for demonstration purposes.</p>
        </div>
      </div>
    </div>
  );
};

export default SensitiveDataManager;