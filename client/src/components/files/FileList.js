import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchFiles = async () => {
      try {
        const res = await axios.get('/api/files', {
          signal: abortController.signal
        });
        if (!abortController.signal.aborted) {
          setFiles(res.data);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Failed to load files. Please try again later.');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFiles();

    return () => abortController.abort();
  }, []);

  // Replace download with placeholder message
  const handleDownload = () => {
    setError('File download functionality disabled');
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
                      onClick={handleDownload}
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