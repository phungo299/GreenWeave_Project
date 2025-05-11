import axiosClient from '../api/axiosClient';

const orderService = {
    // Get all orders for current user
    getAll: () => {
        return axiosClient.get('/orders');
    },

    // Get order by ID
    getById: (id) => {
        return axiosClient.get(`/orders/${id}`);
    },

    // Create new order
    create: (orderData) => {
        return axiosClient.post('/orders', orderData);
    },

    // Update order status (admin only)
    updateStatus: (id, status) => {
        return axiosClient.put(`/orders/${id}/status`, { status });
    },

    // Cancel order
    cancel: (id) => {
        return axiosClient.post(`/orders/${id}/cancel`);
    },

    // Get order statistics (admin only)
    getStatistics: () => {
        return axiosClient.get('/orders/statistics');
    },

    // Get all orders (admin only)
    getAllOrders: (params) => {
        return axiosClient.get('/admin/orders', { params });
    },

    // Get order details (admin only)
    getOrderDetails: (id) => {
        return axiosClient.get(`/admin/orders/${id}`);
    },

    // Update order (admin only)
    updateOrder: (id, data) => {
        return axiosClient.put(`/admin/orders/${id}`, data);
    }
};
export default orderService; 