import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import DatabaseBanner from '../common/DatabaseBanner';
import DatabaseSelector from '../common/DatabaseSelector';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <DatabaseBanner />
      <div className="container mt-4">
        <DatabaseSelector />
        <main className="py-4">
          {children}
        </main>
      </div>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;