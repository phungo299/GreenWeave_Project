import axiosClient from '../api/axiosClient';

const userService = {
    // Get all users (admin only)
    getAll: (params) => {
        return axiosClient.get('/admin/users', { params });
    },

    // Get user by ID (admin only)
    getById: (id) => {
        return axiosClient.get(`/admin/users/${id}`);
    },

    // Create new user (admin only)
    create: (userData) => {
        return axiosClient.post('/admin/users', userData);
    },

    // Update user (admin only)
    update: (id, userData) => {
        return axiosClient.put(`/admin/users/${id}`, userData);
    },

    // Delete user (admin only)
    delete: (id) => {
        return axiosClient.delete(`/admin/users/${id}`);
    },

    // Update user role (admin only)
    updateRole: (id, role) => {
        return axiosClient.put(`/admin/users/${id}/role`, { role });
    },

    // Get user statistics (admin only)
    getStatistics: () => {
        return axiosClient.get('/admin/users/statistics');
    },

    // Search users (admin only)
    search: (query) => {
        return axiosClient.get('/admin/users/search', { params: { q: query } });
    },

    // Get user addresses
    getAddresses: () => {
        return axiosClient.get('/users/addresses');
    },

    // Add new address
    addAddress: (addressData) => {
        return axiosClient.post('/users/addresses', addressData);
    },

    // Update address
    updateAddress: (id, addressData) => {
        return axiosClient.put(`/users/addresses/${id}`, addressData);
    },

    // Delete address
    deleteAddress: (id) => {
        return axiosClient.delete(`/users/addresses/${id}`);
    }
};
export default userService;