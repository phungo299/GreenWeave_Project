import axiosClient from '../api/axiosClient';

const productService = {
    // Get all products with optional filters
    getAll: (params) => {
        return axiosClient.get('/products', { params });
    },

    // Get product by ID
    getById: (id) => {
        return axiosClient.get(`/products/${id}`);
    },

    // Create new product (admin only)
    create: (data) => {
        return axiosClient.post('/products', data);
    },

    // Update product (admin only)
    update: (id, data) => {
        return axiosClient.put(`/products/${id}`, data);
    },

    // Delete product (admin only)
    delete: (id) => {
        return axiosClient.delete(`/products/${id}`);
    },

    // Get product categories
    getCategories: () => {
        return axiosClient.get('/products/categories');
    },

    // Get products by category
    getByCategory: (category) => {
        return axiosClient.get(`/products/category/${category}`);
    },

    // Search products
    search: (query) => {
        return axiosClient.get('/products/search', { params: { q: query } });
    },

    // Get featured products
    getFeatured: () => {
        return axiosClient.get('/products/featured');
    },

    // Get upcoming products
    getUpcoming: () => {
        return axiosClient.get('/products/upcoming');
    }
};
export default productService; 