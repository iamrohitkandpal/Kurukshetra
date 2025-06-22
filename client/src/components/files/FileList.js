import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/files');
      setFiles(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load files');
      console.error('File fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const downloadFile = (filename) => {
    // A03: Path Traversal vulnerability
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.open(`${baseUrl}/uploads/${filename}`);
  };

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4 className="alert-heading">⚠️ Error Loading Files</h4>
          <p>{error}</p>
          <p>Server may be down or uninitialized.</p>
          <div className="mt-3">
            <button 
              className="btn btn-outline-warning"
              onClick={() => fetchFiles()}
            >
              Retry Loading Files
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="row">
          {[1, 2, 3].map((n) => (
            <div key={n} className="col-12 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="skeleton-loader w-75"></div>
                  <div className="skeleton-loader w-25 mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>My Files</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {files.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.filename}</td>
                  <td>{Math.round(file.size / 1024)} KB</td>
                  <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => downloadFile(file.filename)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No files uploaded yet.</p>
      )}
    </div>
  );
};

export default FileList;