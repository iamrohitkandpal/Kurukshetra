import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DatabaseBanner from '../common/DatabaseBanner';
import DatabaseSelector from '../common/DatabaseSelector';
import { ErrorBoundary } from '../common/ErrorBoundary';

const ErrorFallback = ({ error, componentName }) => (
  <div className="alert alert-danger m-3">
    <h4>{componentName} Error</h4>
    <p>{error?.message}</p>
    <button 
      className="btn btn-outline-danger btn-sm"
      onClick={() => window.location.reload()}
    >
      Reload
    </button>
  </div>
);

const Layout = ({ children }) => {
  return (
    <div className="app-wrapper theme-dark">
      <ErrorBoundary fallback={<ErrorFallback componentName="Sidebar" />}>
        <Sidebar />
      </ErrorBoundary>
      <div className="main-container">
        <ErrorBoundary fallback={<ErrorFallback componentName="Navbar" />}>
          <Navbar />
        </ErrorBoundary>
        <ErrorBoundary fallback={<ErrorFallback componentName="DatabaseBanner" />}>
          <DatabaseBanner />
        </ErrorBoundary>
        <div className="content-wrapper">
          <ErrorBoundary fallback={<ErrorFallback componentName="Content" />}>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;