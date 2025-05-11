import axiosClient from '../api/axiosClient';

const cartService = {
    // Get cart items
    getCart: () => {
        return axiosClient.get('/cart');
    },

    // Add item to cart
    addItem: (productId, quantity) => {
        return axiosClient.post('/cart/items', { productId, quantity });
    },

    // Update cart item quantity
    updateQuantity: (itemId, quantity) => {
        return axiosClient.put(`/cart/items/${itemId}`, { quantity });
    },

    // Remove item from cart
    removeItem: (itemId) => {
        return axiosClient.delete(`/cart/items/${itemId}`);
    },

    // Clear cart
    clearCart: () => {
        return axiosClient.delete('/cart');
    },

    // Get cart total
    getTotal: () => {
        return axiosClient.get('/cart/total');
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