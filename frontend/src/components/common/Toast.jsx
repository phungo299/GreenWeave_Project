import React, { useState, useEffect, createContext, useContext } from 'react';
import './Toast.css';

// Toast context for global toast management
const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type, // 'success', 'error', 'warning', 'info'
            duration
        };

        setToasts(prevToasts => [...prevToasts, toast]);

        // Auto remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    const showSuccess = (message, duration = 3000) => addToast(message, 'success', duration);
    const showError = (message, duration = 4000) => addToast(message, 'error', duration);
    const showWarning = (message, duration = 3500) => addToast(message, 'warning', duration);
    const showInfo = (message, duration = 3000) => addToast(message, 'info', duration);

    // Expose toast functions globally for overrideAlert compatibility
    useEffect(() => {
        window.toast = {
            success: showSuccess,
            error: showError,
            warning: showWarning,
            info: showInfo
        };

        // Cleanup on unmount
        return () => {
            window.toast = null;
        };
    }, []);

    const contextValue = {
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        toasts
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match CSS animation duration
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div 
            className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''} ${isExiting ? 'toast-exiting' : ''}`}
            onClick={handleClose}
        >
            <div className="toast-icon">
                {getIcon()}
            </div>
            <div className="toast-content">
                <span className="toast-message">{toast.message}</span>
            </div>
            <button 
                className="toast-close-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                aria-label="Đóng thông báo"
            >
                ×
            </button>
        </div>
    );
};

export default Toast; 