import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Choose a file');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFile(null);
      setFileName('Choose a file');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      // A06: Vulnerable file upload - No file type validation
      // Create custom axios instance for this request to track progress
      const uploadResponse = await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setSuccess('File uploaded successfully');
      setFileName('Choose a file');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
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
              <label className="form-label">Choose File</label>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control"
                  id="fileInput"
                  onChange={handleFileChange}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!file || loading}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {loading && (
                <div className="progress mt-2">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>
          </form>

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