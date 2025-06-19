import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { DatabaseContext } from '../../context/DatabaseContext';

const DatabaseBanner = () => {
  const { dbType } = useContext(DatabaseContext);

  return (
    <div className="bg-light border-bottom py-2">
      <div className="container d-flex align-items-center">
        <span className="me-2">Active DB:</span>
        <span className="fw-bold">
          {dbType === 'mongodb' ? 'MongoDB 🍃' : 'SQLite 🗃️'}
        </span>
        <span className="badge bg-info ms-2">
          {dbType === 'mongodb' ? 'NoSQL' : 'SQL'} Injection Training
        </span>
      </div>
    </div>
  );
};

DatabaseBanner.propTypes = {
  children: PropTypes.node
};

export default DatabaseBanner;