// Utility functions for showing notifications
export const notification = {
  success: (message, title = 'Thành công') => {
    if (window.showNotification) {
      window.showNotification({
        type: 'success',
        title,
        message,
        duration: 4000
      });
    } else {
      // Fallback: create notification directly if container not ready
      console.log(`✅ ${title}: ${message}`);
      showFallbackNotification('success', title, message);
    }
  },

  error: (message, title = 'Lỗi') => {
    if (window.showNotification) {
      window.showNotification({
        type: 'error',
        title,
        message,
        duration: 5000
      });
    } else {
      // Fallback: create notification directly if container not ready
      console.log(`❌ ${title}: ${message}`);
      showFallbackNotification('error', title, message);
    }
  },

  warning: (message, title = 'Cảnh báo') => {
    if (window.showNotification) {
      window.showNotification({
        type: 'warning',
        title,
        message,
        duration: 4000
      });
    } else {
      // Fallback: create notification directly if container not ready
      console.log(`⚠️ ${title}: ${message}`);
      showFallbackNotification('warning', title, message);
    }
  },

  info: (message, title = 'Thông tin') => {
    if (window.showNotification) {
      window.showNotification({
        type: 'info',
        title,
        message,
        duration: 4000
      });
    } else {
      // Fallback: create notification directly if container not ready
      console.log(`ℹ️ ${title}: ${message}`);
      showFallbackNotification('info', title, message);
    }
  }
};

// Fallback notification function
const showFallbackNotification = (type, title, message) => {
  // Create notification element directly
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} notification-top-right`;
  
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const colors = {
    success: '#52c41a',
    error: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff'
  };
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon" style="color: ${colors[type]}; font-size: 20px;">
        ${icons[type]}
      </div>
      <div class="notification-text">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        ✕
      </button>
    </div>
    <div class="notification-progress notification-progress-${type}" style="animation-duration: 4000ms"></div>
  `;
  
  // Add styles if not already added
  if (!document.getElementById('fallback-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'fallback-notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        z-index: 9999;
        min-width: 320px;
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid;
      }
      .notification-top-right { top: 20px; right: 20px; }
      .notification-success { border-left-color: #52c41a; }
      .notification-error { border-left-color: #ff4d4f; }
      .notification-warning { border-left-color: #faad14; }
      .notification-info { border-left-color: #1890ff; }
      .notification-content { display: flex; align-items: flex-start; padding: 16px; gap: 12px; }
      .notification-text { flex: 1; }
      .notification-title { font-weight: 600; font-size: 14px; color: #262626; margin-bottom: 4px; }
      .notification-message { font-size: 14px; color: #595959; line-height: 1.4; }
      .notification-close { background: none; border: none; color: #8c8c8c; cursor: pointer; padding: 4px; border-radius: 4px; }
      .notification-progress { height: 3px; width: 100%; animation: progress linear; }
      .notification-progress-success { background: linear-gradient(90deg, #52c41a, #73d13d); }
      .notification-progress-error { background: linear-gradient(90deg, #ff4d4f, #ff7875); }
      .notification-progress-warning { background: linear-gradient(90deg, #faad14, #ffc53d); }
      .notification-progress-info { background: linear-gradient(90deg, #1890ff, #40a9ff); }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes progress { from { width: 100%; } to { width: 0%; } }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }
  }, type === 'error' ? 5000 : 4000);
};

export default notification; 