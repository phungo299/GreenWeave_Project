/**
 * Stock Management Utilities
 * Provides comprehensive stock checking and validation functions
 * Similar to major e-commerce platforms (Amazon, Shopee)
 */

/**
 * Check if a product is available for purchase
 * @param {Object} product - Product object with stock and quantity properties
 * @returns {boolean} - true if product is available, false otherwise
 */
export const isProductAvailable = (product) => {
    if (!product) return false;
    
    // Check stock status string
    if (product.stock === "Hết hàng") return false;
    
    // Check numeric quantity
    if (product.quantity !== undefined && product.quantity <= 0) return false;
    
    return true;
};

/**
 * Get detailed stock status with user-friendly message
 * @param {Object} product - Product object
 * @returns {Object} - {status: string, message: string, isAvailable: boolean}
 */
export const getStockStatus = (product) => {
    if (!product) {
        return {
            status: 'unavailable',
            message: 'Sản phẩm không tồn tại',
            isAvailable: false
        };
    }
    
    // Priority 1: Check stock string status
    if (product.stock === "Hết hàng") {
        return {
            status: 'out-of-stock',
            message: 'Hết hàng',
            isAvailable: false
        };
    }
    
    // Priority 2: Check numeric quantity
    if (product.quantity !== undefined && product.quantity <= 0) {
        return {
            status: 'out-of-stock',
            message: 'Hết hàng',
            isAvailable: false
        };
    }
    
    // Priority 3: Check for low stock
    if (product.quantity !== undefined && product.quantity <= 5) {
        return {
            status: 'low-stock',
            message: `Chỉ còn ${product.quantity} sản phẩm`,
            isAvailable: true
        };
    }
    
    // Priority 4: Check for "Sắp về" status
    if (product.stock === "Sắp về") {
        return {
            status: 'coming-soon',
            message: 'Sắp về hàng',
            isAvailable: false
        };
    }
    
    // Default: Available
    return {
        status: 'available',
        message: 'Còn hàng',
        isAvailable: true
    };
};

/**
 * Get maximum quantity allowed for purchase
 * @param {Object} product - Product object
 * @param {number} currentQuantity - Current quantity in cart (default: 0)
 * @returns {number} - Maximum quantity allowed
 */
export const getMaxQuantityAllowed = (product, currentQuantity = 0) => {
    if (!product || !isProductAvailable(product)) return 0;
    
    // If no quantity specified, assume unlimited (but cap at reasonable number)
    if (product.quantity === undefined || product.quantity === null) {
        return 99; // Reasonable cap for unlimited stock
    }
    
    // Return available quantity minus what's already in cart
    return Math.max(0, product.quantity - currentQuantity);
};

/**
 * Validate if cart item quantity is still valid against current stock
 * @param {Object} cartItem - Cart item with productId reference and quantity
 * @returns {Object} - {isValid: boolean, error?: string, maxAllowed?: number}
 */
export const validateCartItemStock = (cartItem) => {
    if (!cartItem) {
        return {
            isValid: false,
            error: 'Item không hợp lệ'
        };
    }
    
    // Extract product info (handle both populated and non-populated productId)
    const product = cartItem.productId && typeof cartItem.productId === 'object' 
        ? cartItem.productId 
        : cartItem.product || cartItem;
    
    if (!product) {
        return {
            isValid: false,
            error: 'Không tìm thấy thông tin sản phẩm'
        };
    }
    
    // Check if product is available
    const stockStatus = getStockStatus(product);
    if (!stockStatus.isAvailable) {
        return {
            isValid: false,
            error: `${product.name || 'Sản phẩm'} hiện ${stockStatus.message.toLowerCase()}`,
            maxAllowed: 0
        };
    }
    
    // Check if requested quantity exceeds available stock
    const maxAllowed = getMaxQuantityAllowed(product);
    if (cartItem.quantity > maxAllowed) {
        return {
            isValid: false,
            error: `${product.name || 'Sản phẩm'} chỉ còn ${maxAllowed} sản phẩm`,
            maxAllowed: maxAllowed
        };
    }
    
    return {
        isValid: true,
        maxAllowed: maxAllowed
    };
};

/**
 * Check if quantity can be increased for a product
 * @param {Object} product - Product object
 * @param {number} currentQuantity - Current selected quantity
 * @returns {boolean} - true if can increase, false otherwise
 */
export const canIncreaseQuantity = (product, currentQuantity) => {
    if (!isProductAvailable(product)) return false;
    
    const maxAllowed = getMaxQuantityAllowed(product);
    return currentQuantity < maxAllowed;
};

/**
 * Get stock warning message for UI display
 * @param {Object} product - Product object
 * @param {number} requestedQuantity - Requested quantity
 * @returns {string|null} - Warning message or null if no warning
 */
export const getStockWarningMessage = (product, requestedQuantity = 1) => {
    if (!product) return 'Sản phẩm không tồn tại';
    
    const stockStatus = getStockStatus(product);
    
    if (!stockStatus.isAvailable) {
        return `Sản phẩm ${stockStatus.message.toLowerCase()}`;
    }
    
    const maxAllowed = getMaxQuantityAllowed(product);
    if (requestedQuantity > maxAllowed) {
        return `Số lượng tối đa có thể đặt là ${maxAllowed}`;
    }
    
    return null;
};

/**
 * Filter out invalid cart items based on stock status
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} - {validItems: Array, invalidItems: Array}
 */
export const filterValidCartItems = (cartItems) => {
    if (!Array.isArray(cartItems)) {
        return { validItems: [], invalidItems: [] };
    }
    
    const validItems = [];
    const invalidItems = [];
    
    cartItems.forEach(item => {
        const validation = validateCartItemStock(item);
        if (validation.isValid) {
            validItems.push(item);
        } else {
            invalidItems.push({
                ...item,
                error: validation.error
            });
        }
    });
    
    return { validItems, invalidItems };
}; 