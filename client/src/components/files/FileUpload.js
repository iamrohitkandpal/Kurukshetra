import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // A06: Vulnerable file upload - No file type validation
      await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('File uploaded successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>File Upload</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={onSubmit} className="mb-3">
        <div className="mb-3">
          <label className="form-label">Choose File</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="alert alert-info">
        <h4 className="alert-heading">Supported Features</h4>
        <ul>
          <li>File upload with no size restrictions</li>
          <li>All file types accepted</li>
          <li>Files stored in public directory</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;