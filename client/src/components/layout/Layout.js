import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DatabaseBanner from '../common/DatabaseBanner';
import DatabaseSelector from '../common/DatabaseSelector';

const Layout = ({ children }) => {
  return (
    <div className="app-wrapper theme-dark">
      <Sidebar />
      <div className="main-container">
        <Navbar />
        <DatabaseBanner />
        <div className="content-wrapper">
          <DatabaseSelector />
          <main className="main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;