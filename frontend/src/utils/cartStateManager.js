/**
 * Cart State Manager - Utility for managing cart state persistence and data transformation
 * Centralizes cart data handling logic for consistency across the app
 */

class CartStateManager {
    constructor() {
        this.STORAGE_KEY = 'cart';
        this.VERSION = '1.0';
    }

    /**
     * Transform API response to consistent cart item format
     * @param {Object} apiItem - Item from API response
     * @returns {Object} Standardized cart item
     */
    transformApiItem(apiItem) {
        return {
            cartItemId: apiItem._id,
            _id: apiItem._id,
            id: apiItem.productId?._id || apiItem.productId,
            name: apiItem.productId?.name || '',
            title: apiItem.productId?.title || '',
            color: apiItem.color || apiItem.productId?.selectedColor || '',
            size: apiItem.productId?.selectedSize || '',
            price: this.parsePrice(apiItem.productId?.price),
            quantity: parseInt(apiItem.quantity) || 1,
            productId: apiItem.productId,
            image: this.getProductImage(apiItem.productId),
            isOptimistic: false,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Transform product data to cart item format (for adding new items)
     * @param {Object} product - Product object
     * @param {Object} options - Additional options (color, size, quantity, etc.)
     * @returns {Object} Cart item format
     */
    transformProductToCartItem(product, options = {}) {
        return {
            cartItemId: `temp_${Date.now()}`,
            id: product.id || product._id,
            name: product.name || '',
            title: product.title || '',
            color: options.color || product.selectedColor || '',
            size: options.size || product.selectedSize || '',
            price: this.parsePrice(product.price),
            quantity: parseInt(options.quantity) || 1,
            image: this.getProductImage(product),
            variantId: options.variantId || '',
            isOptimistic: true,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Parse price from various formats to number
     * @param {string|number} price - Price in various formats
     * @returns {number} Parsed price
     */
    parsePrice(price) {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            // Remove all non-digit characters except dots
            const cleaned = price.replace(/[^\d.]/g, '');
            return parseFloat(cleaned) || 0;
        }
        return 0;
    }

    /**
     * Get product image with fallback
     * @param {Object} product - Product object
     * @returns {string} Image URL
     */
    getProductImage(product) {
        if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images[0];
        }
        return '/assets/images/placeholder-product.png';
    }

    /**
     * Validate cart item structure
     * @param {Object} item - Cart item to validate
     * @returns {boolean} Is valid
     */
    validateCartItem(item) {
        const required = ['id', 'name', 'price', 'quantity'];
        return required.every(field => item.hasOwnProperty(field)) && item.quantity > 0;
    }

    /**
     * Clean cart items by removing invalid items
     * @param {Array} items - Array of cart items
     * @returns {Array} Cleaned items
     */
    cleanCartItems(items) {
        if (!Array.isArray(items)) return [];
        
        return items
            .filter(item => this.validateCartItem(item))
            .map(item => ({
                ...item,
                quantity: Math.max(1, parseInt(item.quantity) || 1),
                price: this.parsePrice(item.price)
            }));
    }

    /**
     * Save cart to localStorage
     * @param {Array} cartItems - Array of cart items
     * @returns {boolean} Success status
     */
    saveToStorage(cartItems) {
        try {
            // Only save non-optimistic items
            const itemsToSave = cartItems.filter(item => !item.isOptimistic);
            const cleanedItems = this.cleanCartItems(itemsToSave);
            
            const cartData = {
                version: this.VERSION,
                items: cleanedItems,
                lastSaved: new Date().toISOString(),
                count: cleanedItems.reduce((sum, item) => sum + item.quantity, 0)
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cartData));
            return true;
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
            return false;
        }
    }

    /**
     * Load cart from localStorage
     * @returns {Array} Cart items array
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return [];

            const cartData = JSON.parse(stored);
            
            // Version compatibility check
            if (cartData.version !== this.VERSION) {
                console.warn('Cart version mismatch, clearing storage');
                this.clearStorage();
                return [];
            }

            return this.cleanCartItems(cartData.items || []);
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            this.clearStorage(); // Clear corrupted data
            return [];
        }
    }

    /**
     * Clear cart from localStorage
     */
    clearStorage() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing cart storage:', error);
        }
    }

    /**
     * Calculate cart statistics
     * @param {Array} cartItems - Array of cart items
     * @returns {Object} Cart statistics
     */
    calculateStats(cartItems) {
        const validItems = this.cleanCartItems(cartItems);
        
        return {
            totalItems: validItems.length,
            totalQuantity: validItems.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            averagePrice: validItems.length > 0 
                ? validItems.reduce((sum, item) => sum + item.price, 0) / validItems.length 
                : 0,
            hasOptimisticItems: validItems.some(item => item.isOptimistic)
        };
    }

    /**
     * Find cart item by criteria
     * @param {Array} cartItems - Array of cart items
     * @param {Object} criteria - Search criteria
     * @returns {Object|null} Found item or null
     */
    findItem(cartItems, criteria) {
        return cartItems.find(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        }) || null;
    }

    /**
     * Check if item exists in cart
     * @param {Array} cartItems - Array of cart items
     * @param {string} productId - Product ID
     * @param {string} color - Product color
     * @param {string} size - Product size
     * @returns {boolean} Item exists
     */
    hasItem(cartItems, productId, color = '', size = '') {
        return cartItems.some(item => 
            item.id === productId && 
            item.color === color && 
            item.size === size
        );
    }

    /**
     * Merge duplicate items in cart
     * @param {Array} cartItems - Array of cart items
     * @returns {Array} Merged cart items
     */
    mergeDuplicates(cartItems) {
        const merged = new Map();
        
        cartItems.forEach(item => {
            const key = `${item.id}_${item.color}_${item.size}`;
            
            if (merged.has(key)) {
                const existing = merged.get(key);
                existing.quantity += item.quantity;
                existing.lastUpdated = new Date().toISOString();
            } else {
                merged.set(key, { ...item });
            }
        });
        
        return Array.from(merged.values());
    }

    /**
     * Prepare cart data for API submission
     * @param {Object} cartItem - Cart item
     * @returns {Object} API format
     */
    prepareForApi(cartItem) {
        return {
            productId: cartItem.id,
            variantId: cartItem.variantId || '',
            color: cartItem.color || '',
            quantity: cartItem.quantity
        };
    }

    /**
     * Create cart summary for display
     * @param {Array} cartItems - Array of cart items
     * @returns {Object} Cart summary
     */
    createSummary(cartItems) {
        const stats = this.calculateStats(cartItems);
        
        return {
            ...stats,
            formattedTotal: this.formatPrice(stats.totalPrice),
            isEmpty: stats.totalItems === 0,
            hasItems: stats.totalItems > 0,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Format price as Vietnamese currency
     * @param {number} price - Price amount
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        return `${price.toLocaleString('vi-VN')} đ`;
    }

    /**
     * Generate unique temporary ID
     * @returns {string} Unique ID
     */
    generateTempId() {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check if cart needs server sync
     * @param {Array} cartItems - Array of cart items
     * @returns {boolean} Needs sync
     */
    needsServerSync(cartItems) {
        return cartItems.some(item => item.isOptimistic);
    }
}

// Create singleton instance
const cartStateManager = new CartStateManager();

export default cartStateManager; 