import axiosClient from '../api/axiosClient';

const userService = {
    // Get all users (admin only)
    getAll: (params) => {
        return axiosClient.get('/users/all', { params });
    },

    // Get user by ID (admin only)
    getById: (userId) => {
        return axiosClient.get(`/users/${userId}`);
    },

    // Get all users including admins (admin only)
    getAllIncludingAdmin: (params) => {
        return axiosClient.get('/users/all-with-admin', { params });
    },

    // Toggle user active status
    toggleStatus: (userId) => {
        return axiosClient.patch(`/users/toggle-status/${userId}`);
    },

    // Create new user (admin only)
    create: (userData) => {
        return axiosClient.post('/users/create', userData);
    },

    // Update user (admin only)
    update: (userId, userData) => {
        return axiosClient.put(`/users/${userId}`, userData);
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
        return axiosClient.get('/users/search', { params: query });
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