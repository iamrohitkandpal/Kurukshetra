import React, { useState } from 'react';
import axios from 'axios';
import Toast from '../common/Toast';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Choose a file');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFile(null);
      setFileName('Choose a file');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      // A06: Still vulnerable file upload - No file type validation
      const uploadResponse = await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      showToast('File uploaded successfully', 'success');
      setFileName('Choose a file');
      setFile(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Upload failed';
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
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
          
          <form onSubmit={onSubmit} className="mb-3">
            <div className="mb-3">
              <label htmlFor="fileInput" className="form-label">Choose File</label>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control"
                  id="fileInput"
                  onChange={handleFileChange}
                />
                <button 
                  type="button"
                  className="btn btn-primary"
                  disabled={!file || loading}
                  aria-label="Upload file"
                >
                  {loading ? 'Uploading...' : 'Upload'}
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

          {loading && (
            <div className="upload-overlay">
              <div className="upload-progress">
                <div className="progress">
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-center">
                  Uploading: {uploadProgress}%
                </div>
              </div>
            </div>
          )}

          <div className="alert alert-info">
            <h5 className="alert-heading">Security Information</h5>
            <p className="mb-0">This file upload functionality contains intentional security vulnerabilities:</p>
            <ul className="mb-0 mt-2">
              <li>No file size restrictions</li>
              <li>All file types accepted (including potentially dangerous ones)</li>
              <li>Files stored in a publicly accessible directory</li>
              <li>No validation of file content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;