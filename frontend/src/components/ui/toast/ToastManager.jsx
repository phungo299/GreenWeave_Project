import React, { useState, useEffect } from 'react';
import './ToastManager.css';

let toastId = 0;

const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Expose toast functions globally
    window.showToast = (type, message, duration = 4000) => {
      const id = ++toastId;
      const toast = { id, type, message, duration };
      
      setToasts(prev => [...prev, toast]);
      
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      
      return id;
    };

    window.removeToast = (id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Quick access functions
    window.toast = {
      success: (message) => window.showToast('success', message, 3000),
      error: (message) => window.showToast('error', message, 4000),
      warning: (message) => window.showToast('warning', message, 3500),
      info: (message) => window.showToast('info', message, 3000)
    };
    
    return () => {
      window.showToast = null;
      window.removeToast = null;
      window.toast = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="toast-manager">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast-item toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button 
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastManager; 