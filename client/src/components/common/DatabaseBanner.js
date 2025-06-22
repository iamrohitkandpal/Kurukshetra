import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { DatabaseContext } from '../../context/DatabaseContext';

const DatabaseBanner = () => {
  const { dbType } = useContext(DatabaseContext);

  return (    <div className="database-banner glass-bg">
      <div className="container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <span className="db-status-icon">
            {dbType === 'mongodb' ? '🍃' : '🗃️'}
          </span>
          <div className="db-info">
            <span className="db-name">
              {dbType === 'mongodb' ? 'MongoDB' : 'SQLite'}
            </span>
            <span className="db-mode">
              {dbType === 'mongodb' ? 'NoSQL' : 'SQL'} Injection Mode
            </span>
          </div>
        </div>
        <div className="db-status">
          <span className="status-badge active">
            <span className="status-dot"></span>
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

DatabaseBanner.propTypes = {
  children: PropTypes.node
};

export default DatabaseBanner;