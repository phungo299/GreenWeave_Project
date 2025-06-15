import axiosClient from "../api/axiosClient";

const createPaymentLink = async (orderData) => {
  const res = await axiosClient.post("/payos/create-payment-link", orderData);
  return res.data;
};

const getPaymentInfo = async (id) => {
  const res = await axiosClient.get(`/payos/payment-info/${id}`);
  return res.data;
};

const createOrder = async (orderData) => {
  try {
    const res = await axiosClient.post("/orders/create", orderData);
    // axiosClient already returns res.data, so res is the data itself
    console.log('✅ Order service raw response:', res);
    
    // 🔧 IMPROVED: Better response structure validation
    // Handle different possible response formats from backend
    
    // Format 1: Standard success response
    if (res && res.success === true && res.data) {
      console.log('📦 Standard success response format detected');
      return res;
    }
    
    // Format 2: Direct data response (legacy or simplified format)
    if (res && res._id) {
      console.log('📦 Direct data response format detected');
      // Wrap in standard format for consistency
      return {
        success: true,
        message: "Đơn hàng được tạo thành công",
        data: res
      };
    }
    
    // Format 3: Success response with different structure
    if (res && (res.success !== false) && (res.id || res.orderId)) {
      console.log('📦 Alternative success response format detected');
      return {
        success: true,
        message: res.message || "Đơn hàng được tạo thành công",
        data: res
      };
    }
    
    // Format 4: Check for error responses that might be misinterpreted
    if (res && res.success === false) {
      console.log('📦 Explicit error response detected');
      const error = new Error(res.message || "Không thể tạo đơn hàng");
      error.success = false;
      error.status = res.status || 400;
      error.data = res.data || null;
      throw error;
    }
    
    // Format 5: Unexpected response format
    console.warn('⚠️ Unexpected response format:', res);
    // If we get here but have some data, try to make the best of it
    if (res && typeof res === 'object') {
      return {
        success: true,
        message: "Đơn hàng được tạo (format không chuẩn)",
        data: res
      };
    }
    
    // Completely invalid response
    const error = new Error("Response không hợp lệ từ server");
    error.success = false;
    error.status = 500;
    error.data = null;
    throw error;
    
  } catch (error) {
    console.error('❌ Order service error:', error);
    
    // 🔧 IMPROVED: Better error categorization
    // Don't re-throw success messages as errors
    if (error.message && (
      error.message.includes('thành công') || 
      error.message.includes('success') ||
      error.message.toLowerCase().includes('created')
    )) {
      console.warn('🔍 Success message detected in error catch block:', error.message);
      // This suggests a backend issue - success was returned but caught as error
      
      // Try to extract useful info if available
      if (error.data && (error.data._id || error.data.id)) {
        return {
          success: true,
          message: "Đơn hàng được tạo thành công",
          data: error.data
        };
      }
      
      // Fallback: re-throw with clearer message
      const error = new Error("Lỗi server: thông báo thành công nhưng không có dữ liệu hợp lệ");
      error.success = false;
      error.status = 500;
      error.data = null;
      throw error;
    }
    
    // Handle real errors
    // Re-throw with proper structure for frontend
    const finalError = new Error(error.message || error?.response?.data?.message || "Không thể tạo đơn hàng");
    finalError.success = false;
    finalError.status = error.status || error?.response?.status || 500;
    finalError.data = error.data || error?.response?.data || null;
    throw finalError;
  }
};

const createTestOrder = async (orderData) => {
  const res = await axiosClient.post("/orders/create-test", orderData);
  return res.data;
};

const cancelPayment = async (orderCode, reason = 'User cancelled') => {
  const res = await axiosClient.post(`/payos/cancel-payment/${orderCode}`, { reason });
  return res.data;
};

const payosService = {
  createPaymentLink,
  getPaymentInfo,
  createOrder,
  createTestOrder,
  cancelPayment,
};

export default payosService; 