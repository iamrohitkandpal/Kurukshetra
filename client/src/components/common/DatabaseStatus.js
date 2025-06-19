import React, { useContext } from 'react';
import { DatabaseContext } from '../../context/DatabaseContext';

const DatabaseStatus = () => {
  const { dbType } = useContext(DatabaseContext);

  return (
    <div className="alert alert-info d-flex align-items-center" role="alert">
      <strong className="me-2">Active Database:</strong>
      <span className={`badge ${dbType === 'mongodb' ? 'bg-success' : 'bg-primary'}`}>
        {dbType === 'mongodb' ? 'MongoDB' : 'SQLite'}
      </span>
      <small className="ms-2 text-muted">
        ({dbType === 'mongodb' ? 'NoSQL' : 'SQL'} Injection Vulnerabilities Enabled)
      </small>
    </div>
  );
};

export default DatabaseStatus;