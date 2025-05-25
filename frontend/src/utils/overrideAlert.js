// Override native alert function with toast
export const overrideAlert = () => {
  // Store original alert function
  const originalAlert = window.alert;
  
  // Override alert with toast
  window.alert = (message) => {
    if (window.toast) {
      // Determine type based on message content
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('thành công') || lowerMessage.includes('success')) {
        window.toast.success(message);
      } else if (lowerMessage.includes('lỗi') || lowerMessage.includes('error') || lowerMessage.includes('không thể')) {
        window.toast.error(message);
      } else if (lowerMessage.includes('cảnh báo') || lowerMessage.includes('warning')) {
        window.toast.warning(message);
      } else {
        window.toast.info(message);
      }
    } else {
      // Fallback to original alert if toast not available
      originalAlert(message);
    }
  };
  
  // Store original for restoration
  window.originalAlert = originalAlert;
  
  console.log('🔄 Alert function overridden with toast notifications');
};

// Restore original alert function
export const restoreAlert = () => {
  if (window.originalAlert) {
    window.alert = window.originalAlert;
    delete window.originalAlert;
    console.log('🔄 Alert function restored');
  }
};

export default overrideAlert; 