import { useState, useEffect } from 'react';
import { ErrorBoundary } from '../common/ErrorBoundary';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import DatabaseBanner from '../common/DatabaseBanner';
import useMediaQuery from '../../hooks/useMediaQuery';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Auto-close sidebar on mobile, keep open on desktop
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="app-wrapper theme-dark">
      <ErrorBoundary fallback={<ErrorFallback componentName="Sidebar" />}>
        <Sidebar className={isSidebarOpen ? 'open' : ''} />
      </ErrorBoundary>
      <div className="main-container">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <DatabaseBanner />
        <div className="content-wrapper">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Layout;