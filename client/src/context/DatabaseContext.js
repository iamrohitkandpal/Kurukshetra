// client/src/context/DatabaseContext.js
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [dbType, setDbType] = useState(localStorage.getItem('dbType') || 'sqlite');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the current database type from the server when the app loads
  useEffect(() => {
    const fetchDbType = async () => {
      try {
        const res = await axios.get('/api/db/type');
        if (res.data && res.data.type) {
          const serverDbType = res.data.type;
          
          // Only update if different to avoid unnecessary rerenders
          if (serverDbType !== dbType) {
            setDbType(serverDbType);
            localStorage.setItem('dbType', serverDbType);
          }
        }
      } catch (error) {
        console.error('Failed to fetch database type:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDbType();
  }, []);

  // Update localStorage whenever dbType changes
  useEffect(() => {
    localStorage.setItem('dbType', dbType);
  }, [dbType]);

  return (
    <DatabaseContext.Provider value={{ dbType, setDbType, isLoading }}>
      {children}
    </DatabaseContext.Provider>
  );
};

DatabaseProvider.propTypes = {
  children: PropTypes.node.isRequired
};