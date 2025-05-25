import axiosClient from '../api/axiosClient';
import API_CONFIG from '../config/api';

const personalService = {
    // ===== USER PROFILE SERVICES =====
    
    /**
     * Lấy thông tin profile của user hiện tại
     */
    getProfile: async () => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật thông tin profile
     * @param {Object} profileData - Dữ liệu profile cần cập nhật
     */
    updateProfile: async (profileData) => {
        try {
            const response = await axiosClient.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Đổi mật khẩu
     * @param {Object} passwordData - {currentPassword, newPassword}
     */
    changePassword: async (passwordData) => {
        try {
            const response = await axiosClient.patch(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ===== ORDER SERVICES =====
    
    /**
     * Lấy danh sách đơn hàng của user
     * @param {string} userId - ID của user
     * @param {Object} params - Query parameters (page, limit, status)
     */
    getUserOrders: async (userId, params = {}) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.ORDERS.USER_ORDERS(userId), { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy chi tiết đơn hàng
     * @param {string} orderId - ID của đơn hàng
     */
    getOrderDetail: async (orderId) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.ORDERS.ORDER_DETAIL(orderId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ===== WISHLIST SERVICES =====
    
    /**
     * Lấy danh sách yêu thích của user
     * @param {string} userId - ID của user
     */
    getWishlist: async (userId) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.WISHLIST.GET_WISHLIST(userId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Thêm sản phẩm vào danh sách yêu thích
     * @param {string} userId - ID của user
     * @param {Object} productData - {productId, color}
     */
    addToWishlist: async (userId, productData) => {
        try {
            const response = await axiosClient.post(API_CONFIG.ENDPOINTS.WISHLIST.ADD_TO_WISHLIST(userId), productData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích
     * @param {string} userId - ID của user
     * @param {string} itemId - ID của item trong wishlist
     */
    removeFromWishlist: async (userId, itemId) => {
        try {
            const response = await axiosClient.delete(API_CONFIG.ENDPOINTS.WISHLIST.REMOVE_FROM_WISHLIST(userId, itemId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Kiểm tra sản phẩm có trong wishlist không
     * @param {string} userId - ID của user
     * @param {string} productId - ID của sản phẩm
     */
    checkWishlistItem: async (userId, productId) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.WISHLIST.CHECK_WISHLIST_ITEM(userId, productId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa toàn bộ wishlist
     * @param {string} userId - ID của user
     */
    clearWishlist: async (userId) => {
        try {
            const response = await axiosClient.delete(API_CONFIG.ENDPOINTS.WISHLIST.CLEAR_WISHLIST(userId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ===== PRODUCT SERVICES =====
    
    /**
     * Lấy thông tin chi tiết sản phẩm
     * @param {string} productId - ID của sản phẩm
     */
    getProductDetail: async (productId) => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_ID(productId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ===== CART SERVICES =====
    
    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param {string} userId - ID của user
     * @param {Object} cartData - {productId, variantId, color, quantity}
     */
    addToCart: async (userId, cartData) => {
        try {
            const response = await axiosClient.post(API_CONFIG.ENDPOINTS.CART.ADD_TO_CART(userId), cartData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ===== ADDRESS SERVICES =====
    
    /**
     * Lấy danh sách địa chỉ của user
     */
    getAddresses: async () => {
        try {
            const response = await axiosClient.get(API_CONFIG.ENDPOINTS.USERS.GET_ADDRESSES);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Thêm địa chỉ mới
     * @param {Object} addressData - Dữ liệu địa chỉ
     */
    addAddress: async (addressData) => {
        try {
            const response = await axiosClient.post(API_CONFIG.ENDPOINTS.USERS.ADD_ADDRESS, addressData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật địa chỉ
     * @param {string} addressId - ID của địa chỉ
     * @param {Object} addressData - Dữ liệu địa chỉ cần cập nhật
     */
    updateAddress: async (addressId, addressData) => {
        try {
            const response = await axiosClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_ADDRESS(addressId), addressData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa địa chỉ
     * @param {string} addressId - ID của địa chỉ
     */
    deleteAddress: async (addressId) => {
        try {
            const response = await axiosClient.delete(API_CONFIG.ENDPOINTS.USERS.DELETE_ADDRESS(addressId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Đặt địa chỉ mặc định
     * @param {string} addressId - ID của địa chỉ
     */
    setDefaultAddress: async (addressId) => {
        try {
            const response = await axiosClient.patch(API_CONFIG.ENDPOINTS.USERS.SET_DEFAULT_ADDRESS(addressId));
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default personalService; 