import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ className }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', ariaLabel: 'Go to Dashboard' },
    { path: '/products', icon: '🔍', label: 'Products', ariaLabel: 'Browse Products' },
    { path: '/profile', icon: '👤', label: 'Profile', ariaLabel: 'View Profile' },
    { path: '/feedback', icon: '📝', label: 'Feedback', ariaLabel: 'Submit Feedback' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ 
      path: '/admin', 
      icon: '⚙️', 
      label: 'Admin', 
      ariaLabel: 'Admin Panel' 
    });
  }

  return (
    <aside
      className={`sidebar glass-bg ${className}`}
      role="navigation"
      aria-label="Main navigation"
      aria-hidden={className !== 'open'}
    >
      <div className="sidebar-header" role="banner">
        <span className="logo-text" aria-hidden="true">KS</span>
        <h1 className="gradient-text mb-0 h5">Kurukshetra</h1>
      </div>

      <nav className="sidebar-menu">
        <ul className="list-unstyled mb-0" role="menu">
          {menuItems.map((item) => (
            <li key={item.path} role="none">
              <Link
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                role="menuitem"
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={item.ariaLabel}
              >
                <span className="sidebar-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer" role="complementary">
        <div className="security-level">
          <span className="security-indicator" aria-hidden="true">🔐</span>
          <span className="visually-hidden">Current security level:</span>
          <small>Security Level: High Risk</small>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string
};

Sidebar.defaultProps = {
  className: ''
};

export default Sidebar;