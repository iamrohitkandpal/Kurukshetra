import React from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'info', onClose }) => {
  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        {type === 'error' && <span className="toast-icon">⚠️</span>}
        {type === 'success' && <span className="toast-icon">✅</span>}
        {type === 'info' && <span className="toast-icon">ℹ️</span>}
        <span className="toast-message">{message}</span>
      </div>
      {onClose && (
        <button className="toast-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'success', 'info']),
  onClose: PropTypes.func
};

export default Toast;
