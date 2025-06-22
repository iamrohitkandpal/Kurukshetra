import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container text-center py-5">
      <h1 className="display-1">🚫</h1>
      <h2 className="mb-4">Access Denied</h2>
      <p className="lead mb-4">
        You don&apos;t have permission to access this resource.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;