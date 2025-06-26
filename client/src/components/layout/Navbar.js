import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import { isAdmin, getRoleBadgeColor, getRoleIcon } from '../../utils/authUtils';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-glass">
        <div className="container">
          {isMobile && (
            <button
              className="btn btn-link text-light d-lg-none me-3"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          )}
          <Link className="navbar-brand gradient-text d-flex align-items-center" to="/">
            <span className="logo-text me-2">KS</span>
            <span className="font-mono">Kurukshetra</span>
          </Link>
          <button
            className="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation menu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              {user ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/products">Products</Link>
                  </li>
                  {isAdmin(user) && (
                    <li className="nav-item">
                      <Link className="nav-link d-flex align-items-center" to="/admin">
                        <span className="me-1">⚡</span>
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile">
                      <div className="d-flex align-items-center">
                        <span className="avatar-wrapper me-2">
                          {getRoleIcon(user.role) || '👤'}
                        </span>
                        <span className="me-2">{user.username}</span>
                        <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={handleLogoutClick}
                      className="nav-link btn btn-link"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowLogoutModal(false)}
                />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to logout?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleLogoutConfirm}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </div>
      )}
    </>
  );
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired
};

export default Navbar;
