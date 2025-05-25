import { useEffect, useState } from 'react';

// Hook để đảm bảo notification system sẵn sàng
export const useNotification = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if notification system is ready
    const checkReady = () => {
      if (window.showNotification) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkReady()) return;

    // Poll until ready
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const showNotification = (type, message, title) => {
    if (window.showNotification) {
      window.showNotification({
        type,
        title: title || getDefaultTitle(type),
        message,
        duration: type === 'error' ? 5000 : 4000
      });
    } else {
      // Fallback to console
      console.log(`${getIcon(type)} ${title || getDefaultTitle(type)}: ${message}`);
    }
  };

  const getDefaultTitle = (type) => {
    const titles = {
      success: 'Thành công',
      error: 'Lỗi',
      warning: 'Cảnh báo',
      info: 'Thông tin'
    };
    return titles[type] || 'Thông báo';
  };

  const getIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  return {
    isReady,
    success: (message, title) => showNotification('success', message, title),
    error: (message, title) => showNotification('error', message, title),
    warning: (message, title) => showNotification('warning', message, title),
    info: (message, title) => showNotification('info', message, title)
  };
};

export default useNotification; 