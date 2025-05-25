import React, { useState, useCallback } from 'react';
import Notification from './Notification';

let notificationId = 0;

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = ++notificationId;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Expose methods globally
  React.useEffect(() => {
    window.showNotification = addNotification;
    // Mark notification system as ready
    window.notificationSystemReady = true;
    console.log('🔔 Notification system ready');
  }, [addNotification]);

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer; 