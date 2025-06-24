import React, { useState } from 'react';
import Toast from '../common/Toast';

const FileUpload = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('File upload functionality disabled');
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">Upload Files</h2>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleUpload} className="mb-3">
            <div className="mb-3">
              <label htmlFor="fileInput" className="form-label">Choose File</label>
              <div className="input-group">
                <input
                  type="text" 
                  className="form-control"
                  placeholder="File upload disabled"
                  disabled
                />
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Upload
                </button>
              </div>
            </div>
          </form>

          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;