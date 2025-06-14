import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useOptimisticCart } from '../hooks/useOptimisticCart';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const {
        cartItems,
        setCartItems,
        loading,
        errors,
        addToCartOptimistic,
        removeFromCartOptimistic,
        updateQuantityOptimistic,
        getCartCount,
        isAnyLoading,
        getCurrentErrors,
        clearError,
        clearAllErrors,
        transformCartItem
    } = useOptimisticCart([]);

    // Load cart data on mount and auth changes
    useEffect(() => {
        const fetchCart = async () => {
            if (isAuthenticated && user?.id) {
                try {
                    const response = await cartService.getCart(user.id);
                    
                    if (response?.items && Array.isArray(response.items)) {
                        // Transform server data using consistent transformer
                        const transformedItems = response.items.map(transformCartItem);
                        setCartItems(transformedItems);
                        return;
                    }
                } catch (err) {
                    console.error('Error fetching cart from server:', err);
                    // Fallback to localStorage if server fails
                }
            }
            
            // Load from localStorage if not authenticated or server fails
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    if (Array.isArray(parsedCart)) {
                        setCartItems(parsedCart);
                    }
                } catch (error) {
                    console.error('Error parsing cart from localStorage:', error);
                    setCartItems([]);
                }
            }
        };

        fetchCart();
    }, [isAuthenticated, user, setCartItems, transformCartItem]);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        // Only save non-optimistic items to localStorage
        const itemsToSave = cartItems.filter(item => !item.isOptimistic);
        localStorage.setItem('cart', JSON.stringify(itemsToSave));
    }, [cartItems]);

    // Enhanced add to cart with better user feedback
    const addToCart = async (item) => {
        try {
            const result = await addToCartOptimistic(item);
            
            if (result.success) {
                // Success feedback can be handled by calling component
                return { success: true, message: 'Sản phẩm đã được thêm vào giỏ hàng!' };
            } else {
                // Error feedback
                return { 
                    success: false, 
                    error: result.error || 'Không thể thêm vào giỏ hàng',
                    opId: result.opId
                };
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            return { 
                success: false, 
                error: 'Có lỗi xảy ra khi thêm vào giỏ hàng' 
            };
        }
    };

    // Enhanced remove from cart
    const removeFromCart = async (cartItemId) => {
        try {
            const result = await removeFromCartOptimistic(cartItemId);
            
            if (result.success) {
                return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
            } else {
                return { 
                    success: false, 
                    error: result.error || 'Không thể xóa sản phẩm',
                    opId: result.opId
                };
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
            return { 
                success: false, 
                error: 'Có lỗi xảy ra khi xóa sản phẩm' 
            };
        }
    };

    // Enhanced update quantity
    const updateQuantity = async (cartItemId, quantity) => {
        if (quantity < 1) return { success: false, error: 'Số lượng phải lớn hơn 0' };
        
        try {
            const result = await updateQuantityOptimistic(cartItemId, quantity);
            
            if (result.success) {
                return { success: true, message: 'Đã cập nhật số lượng' };
            } else {
                return { 
                    success: false, 
                    error: result.error || 'Không thể cập nhật số lượng',
                    opId: result.opId,
                    availableQuantity: errors[result.opId]?.availableQuantity
                };
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            return { 
                success: false, 
                error: 'Có lỗi xảy ra khi cập nhật số lượng' 
            };
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        try {
            setCartItems([]);
            
            if (isAuthenticated && user?.id) {
                await cartService.clearCart(user.id);
            }
            
            return { success: true, message: 'Đã xóa toàn bộ giỏ hàng' };
        } catch (error) {
            console.error('Clear cart error:', error);
            return { 
                success: false, 
                error: 'Không thể xóa giỏ hàng' 
            };
        }
    };

    // Calculate total price of all items
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Get selected items total (for checkout)
    const getSelectedTotal = (selectedItems = {}) => {
        return cartItems.reduce((total, item) => {
            if (selectedItems[item.cartItemId]) {
                return total + (item.price * item.quantity);
            }
            return total;
        }, 0);
    };

    // Check if cart has any items
    const hasItems = () => cartItems.length > 0;

    // Check if specific item exists in cart
    const hasItem = (productId, color = '', size = '') => {
        return cartItems.some(item => 
            item.id === productId && 
            item.color === color && 
            item.size === size
        );
    };

    // Get cart item by product details
    const getCartItem = (productId, color = '', size = '') => {
        return cartItems.find(item => 
            item.id === productId && 
            item.color === color && 
            item.size === size
        );
    };

    // Sync cart with server (manual refresh)
    const syncWithServer = async () => {
        if (!isAuthenticated || !user?.id) return;
        
        try {
            const response = await cartService.getCart(user.id);
            
            if (response?.items && Array.isArray(response.items)) {
                const transformedItems = response.items.map(transformCartItem);
                setCartItems(transformedItems);
                return { success: true };
            }
        } catch (error) {
            console.error('Sync with server failed:', error);
            return { success: false, error: 'Không thể đồng bộ với server' };
        }
    };

    const contextValue = {
        // State
        cartItems,
        loading,
        errors,
        
        // Core operations
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        
        // Utility functions
        getCartCount,
        getCartTotal,
        getSelectedTotal,
        hasItems,
        hasItem,
        getCartItem,
        
        // Status checks
        isAnyLoading,
        getCurrentErrors,
        
        // Error management
        clearError,
        clearAllErrors,
        
        // Server sync
        syncWithServer,
        
        // Direct state setters (for advanced usage)
        setCartItems
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;