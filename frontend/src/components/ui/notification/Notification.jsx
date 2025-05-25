import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Notification.css';

const Notification = ({ 
    id, 
    type = 'info', 
    title, 
    message, 
    duration = 5000, 
    onClose 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = React.useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose && onClose(id);
        }, 300);
    }, [onClose, id]);

    useEffect(() => {
        // Show notification with animation
        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        // Auto hide after duration
        const hideTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [duration, handleClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="notification-icon success" />;
            case 'error':
                return <FaExclamationTriangle className="notification-icon error" />;
            case 'warning':
                return <FaExclamationTriangle className="notification-icon warning" />;
            default:
                return <FaInfoCircle className="notification-icon info" />;
        }
    };

    const getTypeClass = () => {
        switch (type) {
            case 'success':
                return 'notification-success';
            case 'error':
                return 'notification-error';
            case 'warning':
                return 'notification-warning';
            default:
                return 'notification-info';
        }
    };

    return (
        <div 
            className={`notification ${getTypeClass()} ${isVisible ? 'notification-visible' : ''} ${isExiting ? 'notification-exiting' : ''}`}
        >
            <div className="notification-content">
                {getIcon()}
                <div className="notification-text">
                    {title && <div className="notification-title">{title}</div>}
                    <div className="notification-message">{message}</div>
                </div>
            </div>
            <button 
                className="notification-close" 
                onClick={handleClose}
                aria-label="Đóng thông báo"
            >
                <FaTimes />
            </button>
        </div>
    );
};

export default Notification; 