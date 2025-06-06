import axiosClient from '../api/axiosClient';
import API_CONFIG from '../config/api';

const orderService = {
    // ===== ORDER CRUD OPERATIONS =====
    
    /**
     * Lấy tất cả đơn hàng (cho admin)
     * @param {Object} params - Query parameters (page, limit, status, search)
     */
    getAllOrders: async (params = {}) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.ORDERS.GET_ALL || '/orders', { params });
            
            if (response && response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message,
                    pagination: response.pagination
                };
            }
            
            // Fallback cho format cũ
            if (Array.isArray(response)) {
                return {
                    success: true,
                    data: response,
                    message: 'Lấy danh sách đơn hàng thành công'
                };
            }
            
            return {
                success: true,
                data: [],
                message: 'Không có đơn hàng nào'
            };
        } catch (error) {
            console.error('Error in getAllOrders:', error);
            throw new Error(error.message || 'Không thể tải danh sách đơn hàng');
        }
    },

    /**
     * Lấy danh sách đơn hàng của user
     * @param {string} userId - ID của user
     * @param {Object} params - Query parameters (page, limit, status)
     */
    getUserOrders: async (userId, params = {}) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.ORDERS.USER_ORDERS(userId), { params });
            
            if (response && response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            }
            
            // Fallback cho format cũ
            if (Array.isArray(response)) {
                return {
                    success: true,
                    data: response,
                    message: 'Lấy danh sách đơn hàng thành công'
                };
            }
            
            return {
                success: true,
                data: [],
                message: 'Không có đơn hàng nào'
            };
        } catch (error) {
            console.error('Error in getUserOrders:', error);
            
            let errorMessage = 'Không thể tải danh sách đơn hàng';
            
            if (error.status === 400) {
                errorMessage = 'ID người dùng không hợp lệ';
            } else if (error.status === 401) {
                errorMessage = 'Vui lòng đăng nhập để xem đơn hàng';
            } else if (error.status === 0) {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }
            
            throw new Error(errorMessage);
        }
    },

    /**
     * Lấy chi tiết đơn hàng
     * @param {string} orderId - ID của đơn hàng
     */
    getOrderById: async (orderId) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.ORDERS.ORDER_DETAIL(orderId));
            
            if (response && response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            }
            
            // Fallback cho format cũ
            if (response && response._id) {
                return {
                    success: true,
                    data: response,
                    message: 'Lấy thông tin đơn hàng thành công'
                };
            }
            
            throw new Error('Không tìm thấy thông tin đơn hàng');
        } catch (error) {
            console.error('Error in getOrderById:', error);
            
            let errorMessage = 'Không thể tải thông tin đơn hàng';
            
            if (error.status === 400) {
                errorMessage = 'ID đơn hàng không hợp lệ';
            } else if (error.status === 404) {
                errorMessage = 'Không tìm thấy đơn hàng';
            } else if (error.status === 401) {
                errorMessage = 'Không có quyền xem đơn hàng này';
            } else if (error.status === 0) {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }
            
            throw new Error(errorMessage);
        }
    },

    /**
     * Tạo đơn hàng mới
     * @param {string} userId - ID của user
     * @param {Object} orderData - Dữ liệu đơn hàng
     */
    createOrder: async (userId, orderData) => {
        try {
            const response = await axiosClient.post(API_CONFIG.ENDPOINTS.ORDERS.CREATE_ORDER(userId), orderData);
            
            if (response && response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Tạo đơn hàng thành công'
                };
            }
            
            // Fallback cho format cũ
            if (response && response._id) {
                return {
                    success: true,
                    data: response,
                    message: 'Tạo đơn hàng thành công'
                };
            }
            
            throw new Error('Không thể tạo đơn hàng');
        } catch (error) {
            console.error('Error in createOrder:', error);
            
            let errorMessage = 'Không thể tạo đơn hàng';
            
            if (error.status === 400) {
                errorMessage = error.message || 'Dữ liệu đơn hàng không hợp lệ';
            } else if (error.status === 401) {
                errorMessage = 'Vui lòng đăng nhập để đặt hàng';
            } else if (error.status === 0) {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }
            
            throw new Error(errorMessage);
        }
    },

    /**
     * Cập nhật trạng thái đơn hàng
     * @param {string} orderId - ID của đơn hàng
     * @param {string} status - Trạng thái mới (pending, shipped, delivered, cancelled)
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axiosClient.put(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status });
            
            if (response && response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Cập nhật trạng thái đơn hàng thành công'
                };
            }
            
            // Fallback cho format cũ
            if (response && response._id) {
                return {
                    success: true,
                    data: response,
                    message: 'Cập nhật trạng thái đơn hàng thành công'
                };
            }
            
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            
            let errorMessage = 'Không thể cập nhật trạng thái đơn hàng';
            
            if (error.status === 400) {
                errorMessage = error.message || 'Trạng thái không hợp lệ';
            } else if (error.status === 404) {
                errorMessage = 'Không tìm thấy đơn hàng';
            } else if (error.status === 401) {
                errorMessage = 'Không có quyền cập nhật đơn hàng này';
            } else if (error.status === 0) {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }
            
            throw new Error(errorMessage);
        }
    },

    /**
     * Hủy đơn hàng (chỉ được phép hủy khi đơn hàng ở trạng thái pending)
     * @param {string} orderId - ID của đơn hàng
     */
    cancelOrder: async (orderId) => {
        try {
            return await orderService.updateOrderStatus(orderId, 'cancelled');
        } catch (error) {
            throw error;
        }
    },

    // ===== HELPER FUNCTIONS =====
    
    /**
     * Format trạng thái đơn hàng
     * @param {string} status - Trạng thái đơn hàng
     */
    getStatusText: (status) => {
        const statusMap = {
            'pending': 'Đang xử lý',
            'processing': 'Chuẩn bị hàng',
            'shipped': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    },

    /**
     * Lấy class CSS cho trạng thái
     * @param {string} status - Trạng thái đơn hàng
     */
    getStatusClass: (status) => {
        const classMap = {
            'pending': 'pending',
            'processing': 'processing',
            'shipped': 'shipping',
            'delivered': 'delivered',
            'cancelled': 'cancelled'
        };
        return classMap[status] || 'pending';
    },

    /**
     * Kiểm tra xem đơn hàng có thể hủy được không
     * @param {Object} order - Đối tượng đơn hàng
     */
    canCancelOrder: (order) => {
        if (!order) return false;
        return ['pending', 'processing'].includes(order.status);
    },

    /**
     * Tính tổng giá trị đơn hàng
     * @param {Array} items - Danh sách sản phẩm trong đơn hàng
     */
    calculateTotal: (items) => {
        if (!Array.isArray(items)) return 0;
        return items.reduce((total, item) => {
            const price = item.unitPrice || item.price || 0;
            const quantity = item.quantity || 0;
            return total + (price * quantity);
        }, 0);
    },

    /**
     * Format giá tiền
     * @param {number} price - Giá tiền
     */
    formatPrice: (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    },

    /**
     * Format ngày tháng
     * @param {string} dateString - Chuỗi ngày tháng
     */
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

export default orderService; 