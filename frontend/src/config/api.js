// API Configuration
const API_CONFIG = {
    // Sử dụng environment variable hoặc fallback cho development
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    
    // Timeout settings
    TIMEOUT: 10000,
    
    // API endpoints
    ENDPOINTS: {
        // Auth endpoints
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            VERIFY_EMAIL: '/auth/verify-email',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password'
        },
        
        // User endpoints
        USERS: {
            PROFILE: '/users/profile',
            UPDATE_PROFILE: '/users/update-profile',
            CHANGE_PASSWORD: '/users/change-password',
            ADDRESSES: '/users/addresses',
            GET_ADDRESSES: '/users/addresses',
            ADD_ADDRESS: '/users/addresses',
            UPDATE_ADDRESS: (addressId) => `/users/addresses/${addressId}`,
            DELETE_ADDRESS: (addressId) => `/users/addresses/${addressId}`,
            SET_DEFAULT_ADDRESS: (addressId) => `/users/addresses/${addressId}/default`
        },
        
        // Order endpoints
        ORDERS: {
            USER_ORDERS: (userId) => `/orders/user/${userId}`,
            ORDER_DETAIL: (orderId) => `/orders/${orderId}`,
            CREATE_ORDER: (userId) => `/orders/user/${userId}`,
            UPDATE_STATUS: (orderId) => `/orders/${orderId}/status`
        },
        
        // Wishlist endpoints
        WISHLIST: {
            GET_WISHLIST: (userId) => `/wishlists/${userId}`,
            ADD_TO_WISHLIST: (userId) => `/wishlists/${userId}`,
            REMOVE_FROM_WISHLIST: (userId, itemId) => `/wishlists/${userId}/${itemId}`,
            CHECK_WISHLIST_ITEM: (userId, productId) => `/wishlists/${userId}/check/${productId}`,
            CLEAR_WISHLIST: (userId) => `/wishlists/${userId}`
        },
        
        // Product endpoints
        PRODUCTS: {
            GET_ALL: '/products',
            GET_BY_ID: (productId) => `/products/${productId}`,
            SEARCH: '/products/search'
        },
        
        // Cart endpoints
        CART: {
            GET_CART: (userId) => `/carts/${userId}`,
            ADD_TO_CART: (userId) => `/carts/${userId}`,
            UPDATE_CART_ITEM: (userId, itemId) => `/carts/${userId}/${itemId}`,
            REMOVE_FROM_CART: (userId, itemId) => `/carts/${userId}/${itemId}`,
            CLEAR_CART: (userId) => `/carts/${userId}`
        },

        // Upload endpoints
        UPLOAD: {
            IMAGE: '/upload/image',
            AVATAR: '/upload/avatar',
            PRODUCT_IMAGE: '/upload/product-image',
            MULTIPLE_IMAGES: '/upload/multiple-images',
            DELETE_IMAGE: '/upload/delete-image'
        }
    }
};

export default API_CONFIG; 