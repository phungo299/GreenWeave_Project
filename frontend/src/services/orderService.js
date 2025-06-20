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
            if (response && response.orders) {
                return {
                    success: true,
                    data: response.orders,
                    message: 'Lấy danh sách đơn hàng thành công',
                    pagination: response.pagination
                };
            }           
            // Fallback cho format với success field
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
     * Lấy thống kê đơn hàng (cho admin)
     */
    getOrderStats: async () => {
        try {
            const response = await axiosClient.get('/orders/stats');           
            if (response && response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Lấy thống kê đơn hàng thành công'
                };
            }          
            return {
                success: false,
                data: null,
                message: 'Không thể lấy thống kê đơn hàng'
            };
        } catch (error) {
            console.error('Error in getOrderStats:', error);           
            let errorMessage = 'Không thể lấy thống kê đơn hàng';           
            if (error.status === 401) {
                errorMessage = 'Không có quyền truy cập thống kê';
            } else if (error.status === 0) {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }           
            throw new Error(errorMessage);
        }
    },

    /**
     * Tìm kiếm đơn hàng với bộ lọc nâng cao (cho admin)
     * @param {Object} params - Search parameters
     */
    searchOrders: async (params = {}) => {
        try {
            const response = await axiosClient.get('/orders/search', { params });
            if (response && response.orders) {
                return {
                    success: true,
                    data: response.orders,
                    filters: response.filters,
                    pagination: response.pagination,
                    message: 'Tìm kiếm đơn hàng thành công'
                };
            }         
            return {
                success: true,
                data: [],
                filters: params,
                pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
                message: 'Không tìm thấy đơn hàng nào'
            };
        } catch (error) {
            console.error('Error in searchOrders:', error);           
            let errorMessage = 'Không thể tìm kiếm đơn hàng';            
            if (error.status === 401) {
                errorMessage = 'Không có quyền truy cập';
            } else if (error.status === 0) {
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }           
            throw new Error(errorMessage);
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
     * Cập nhật trạng thái đơn hàng linh hoạt với validation
     * @param {string} orderId - ID của đơn hàng
     * @param {string} status - Trạng thái mới
     * @param {string} reason - Lý do thay đổi (optional)
     */
    updateOrderStatusFlexible: async (orderId, status, reason = null) => {
        try {
            const response = await axiosClient.put(`/orders/${orderId}/status-flexible`, { 
                status,
                ...(reason && { reason })
            });
            
            if (response && response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Cập nhật trạng thái đơn hàng thành công'
                };
            }
            
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
        } catch (error) {
            console.error('Error in updateOrderStatusFlexible:', error);
            
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
     * Xác nhận đơn hàng (chuyển từ paid sang confirmed)
     * @param {string} orderId - ID của đơn hàng
     */
    confirmOrder: async (orderId) => {
        try {
            return await orderService.updateOrderStatusFlexible(orderId, 'confirmed', 'Admin confirmed order');
        } catch (error) {
            throw error;
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
            'pending': 'Đang chờ xử lý',
            'paid': 'Đã thanh toán',
            'confirmed': 'Đã xác nhận',
            'shipped': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy',
            'expired': 'Đã hết hạn'
        };
        return statusMap[status] || status;
    },

    /**
     * Lấy màu sắc cho trạng thái
     * @param {string} status - Trạng thái đơn hàng
     */
    getStatusColor: (status) => {
        const colorMap = {
            'pending': '#FFA500',      // Orange
            'paid': '#2196F3',         // Blue
            'confirmed': '#9C27B0',    // Purple
            'shipped': '#FF9800',      // Amber
            'delivered': '#4CAF50',    // Green
            'cancelled': '#F44336',    // Red
            'expired': '#757575'       // Gray
        };
        return colorMap[status] || '#757575';
    },

    /**
     * Lấy class CSS cho trạng thái
     * @param {string} status - Trạng thái đơn hàng
     */
    getStatusClass: (status) => {
        const classMap = {
            'pending': 'pending',
            'paid': 'paid',
            'confirmed': 'confirmed',
            'shipped': 'shipping',
            'delivered': 'delivered',
            'cancelled': 'cancelled',
            'expired': 'expired'
        };
        return classMap[status] || 'pending';
    },

    /**
     * Kiểm tra xem đơn hàng có thể xác nhận được không
     * @param {Object} order - Đối tượng đơn hàng
     */
    canConfirmOrder: (order) => {
        if (!order) return false;
        return order.status === 'paid';
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
     * Kiểm tra xem đơn hàng có thể cập nhật trạng thái không
     * @param {Object} order - Đối tượng đơn hàng
     * @param {string} newStatus - Trạng thái mới
     */
    canUpdateStatus: (order, newStatus) => {
        if (!order) return false;
        
        const statusFlow = {
            'pending': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        };
        
        return statusFlow[order.status]?.includes(newStatus) || false;
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
    },

    /**
     * Tạo bộ lọc mặc định cho search
     */
    getDefaultSearchFilters: () => ({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }),

    /**
     * Validate search parameters
     * @param {Object} params - Search parameters
     */
    validateSearchParams: (params) => {
        const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
        const validSortFields = ['createdAt', 'totalAmount', 'status'];
        const validSortOrders = ['asc', 'desc'];

        const errors = [];

        if (params.status && !validStatuses.includes(params.status)) {
            errors.push('Trạng thái không hợp lệ');
        }

        if (params.sortBy && !validSortFields.includes(params.sortBy)) {
            errors.push('Trường sắp xếp không hợp lệ');
        }

        if (params.sortOrder && !validSortOrders.includes(params.sortOrder)) {
            errors.push('Thứ tự sắp xếp không hợp lệ');
        }

        if (params.minAmount && params.maxAmount && params.minAmount > params.maxAmount) {
            errors.push('Giá trị tối thiểu phải nhỏ hơn giá trị tối đa');
        }

        return errors;
    },

    retryPayment: async (orderId) => {
        return axiosClient.post(`/orders/${orderId}/retry-payment`);
    }
};

export default orderService; 