import axiosClient from '../api/axiosClient';

const cartService = {
    // Get cart items
    getCart: (userId) => {
        return axiosClient.get(`/carts/${userId}`);
    },

    // Add item to cart
    addToCart: (userId, cartData) => {
        return axiosClient.post(`/carts/${userId}/items`, cartData);
    },

    // Update cart item quantity
    updateQuantity: (userId, itemId, quantity) => {
        return axiosClient.put(`/carts/${userId}/items/${itemId}`, { quantity });
    },

    // Remove item from cart
    removeItem: (userId, itemId) => {
        return axiosClient.delete(`/carts/${userId}/items/${itemId}`);
    },

    // Clear cart
    clearCart: (userId) => {
        return axiosClient.delete(`/carts/${userId}`);
    },

    // Get cart total
    getTotal: (userId) => {
        return axiosClient.get(`/carts/${userId}/total`);
    },

    // Apply coupon
    applyCoupon: (couponCode) => {
        return axiosClient.post('/cart/coupon', { couponCode });
    },

    // Remove coupon
    removeCoupon: () => {
        return axiosClient.delete('/cart/coupon');
    }
};
export default cartService; 