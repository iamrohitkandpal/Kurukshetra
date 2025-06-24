import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { isAdmin, getRoleBadgeColor, getRoleIcon } from '../../utils/authUtils';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
          <Link className="navbar-brand gradient-text d-flex align-items-center" to="/">
            <span className="logo-text me-2">KS</span>
            <span className="font-mono">Kurukshetra</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
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

export default Navbar;
