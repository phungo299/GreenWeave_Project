import axiosClient from '../api/axiosClient';

const settingService = {
    // Get all settings (Admin only)
    getAllSettings: (params = {}) => {
        const { page, limit, category, sortBy, sortOrder } = params;
        return axiosClient.get('/settings', { params: { page, limit, category, sortBy, sortOrder } });
    },

    // Get settings by key
    getSettingByKey: (key) => {
        return axiosClient.get(`/settings/${key}`);
    },

    // Get public settings (no auth required)
    getPublicSettings: (category) => {
        return axiosClient.get('/settings/public', { params: { category } });
    },

    // Create new settings (Admin only)
    createSetting: (settingData) => {
        return axiosClient.post('/settings', settingData);
    },

    // Update settings (Admin only)
    updateSetting: (key, settingData) => {
        return axiosClient.put(`/settings/${key}`, settingData);
    },

    // Delete settings (Admin only)
    deleteSetting: (key) => {
        return axiosClient.delete(`/settings/${key}`);
    },

    // Get list of categories
    getSettingCategories: () => {
        return axiosClient.get('/settings/categories');
    }
};
export default settingService;