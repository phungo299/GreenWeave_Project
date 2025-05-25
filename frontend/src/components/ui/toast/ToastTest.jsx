import React from 'react';

const ToastTest = () => {
  const testToasts = () => {
    // Test different types
    setTimeout(() => window.toast?.success('Đây là thông báo thành công!'), 100);
    setTimeout(() => window.toast?.error('Đây là thông báo lỗi!'), 600);
    setTimeout(() => window.toast?.warning('Đây là thông báo cảnh báo!'), 1100);
    setTimeout(() => window.toast?.info('Đây là thông báo thông tin!'), 1600);
    
    // Test alert override
    setTimeout(() => alert('Đây là alert đã được override!'), 2100);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Toast System Test</h3>
      <button 
        onClick={testToasts}
        style={{
          padding: '10px 20px',
          backgroundColor: '#134d35',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test All Toasts
      </button>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => window.toast?.success('Success!')}>Success</button>
        <button onClick={() => window.toast?.error('Error!')}>Error</button>
        <button onClick={() => window.toast?.warning('Warning!')}>Warning</button>
        <button onClick={() => window.toast?.info('Info!')}>Info</button>
        <button onClick={() => alert('Alert Test!')}>Alert Test</button>
      </div>
    </div>
  );
};

export default ToastTest; 