import axiosClient from '../api/axiosClient';

const messageService = {
    // Gửi tin nhắn liên hệ
    create: (data) => {
        return axiosClient.post('/messages', {
            name: data.name,
            email: data.email,
            message: data.message,
            phone: data.phone || '', // Optional
            subject: data.subject || '' // Optional
        });
    },

    // Lấy tất cả tin nhắn (admin only)
    getAll: (params = {}) => {
        return axiosClient.get('/messages', { params });
    },

    // Lấy tin nhắn theo ID
    getById: (id) => {
        return axiosClient.get(`/messages/${id}`);
    },

    // Xóa tin nhắn (admin only)
    delete: (id) => {
        return axiosClient.delete(`/messages/${id}`);
    }
};

export default messageService; 