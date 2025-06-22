import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/products', icon: '🔍', label: 'Products' },
    { path: '/files', icon: '📁', label: 'Files' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/feedback', icon: '📝', label: 'Feedback' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', icon: '⚙️', label: 'Admin' });
  }

  return (
    <div className="sidebar glass-bg">
      <div className="sidebar-header">
        <img src="/public/images/logo/logo32.png" alt="Logo" className="sidebar-logo" />
        <h5 className="gradient-text mb-0">Kurukshetra</h5>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="security-level">
          <span className="security-indicator">🔐</span>
          <small>Security Level: High Risk</small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;