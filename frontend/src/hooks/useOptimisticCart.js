import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';

/**
 * Custom hook for optimistic cart operations with rollback capabilities
 * Provides immediate UI feedback while handling API calls in background
 */
export const useOptimisticCart = (initialItems = []) => {
    const [cartItems, setCartItems] = useState(initialItems);
    const [loading, setLoading] = useState({});
    const [errors, setErrors] = useState({});
    const { user, isAuthenticated } = useAuth();
    const operationQueue = useRef(new Map());

    // Generate unique operation ID
    const generateOpId = () => `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Clear error for specific operation
    const clearError = useCallback((opId) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[opId];
            return newErrors;
        });
    }, []);

    // Set loading state for operation
    const setLoadingState = useCallback((opId, isLoading) => {
        setLoading(prev => ({
            ...prev,
            [opId]: isLoading
        }));
    }, []);

    // Transform server response to consistent format
    const transformCartItem = useCallback((apiItem) => ({
        cartItemId: apiItem._id,
        _id: apiItem._id,
        id: apiItem.productId._id || apiItem.productId,
        name: apiItem.productId.name || '',
        title: apiItem.productId.title || '',
        color: apiItem.color || apiItem.productId?.selectedColor || '',
        size: apiItem.productId?.selectedSize || '',
        price: apiItem.productId?.price || 0,
        quantity: apiItem.quantity,
        productId: apiItem.productId,
        image: apiItem.productId?.images?.[0] || '/assets/images/placeholder-product.png'
    }), []);

    // Optimistic add to cart
    const addToCartOptimistic = useCallback(async (item) => {
        const opId = generateOpId();
        const tempId = `temp_${Date.now()}`;
        
        // Clear any previous errors
        clearError(opId);
        setLoadingState(opId, true);

        // Optimistic update - add immediately to UI
        const optimisticItem = {
            ...item,
            cartItemId: tempId,
            _id: tempId,
            isOptimistic: true
        };

        setCartItems(prevItems => {
            const existingIndex = prevItems.findIndex(
                cartItem => cartItem.id === item.id && 
                           cartItem.color === item.color && 
                           cartItem.size === item.size
            );

            if (existingIndex !== -1) {
                // Update existing item quantity
                const updatedItems = [...prevItems];
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity: updatedItems[existingIndex].quantity + item.quantity,
                    isOptimistic: true
                };
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, optimisticItem];
            }
        });

        // Store rollback function
        const rollback = () => {
            setCartItems(prevItems => {
                const existingIndex = prevItems.findIndex(
                    cartItem => cartItem.id === item.id && 
                               cartItem.color === item.color && 
                               cartItem.size === item.size
                );

                if (existingIndex !== -1) {
                    const updatedItems = [...prevItems];
                    if (updatedItems[existingIndex].quantity > item.quantity) {
                        // Rollback quantity
                        updatedItems[existingIndex].quantity -= item.quantity;
                        delete updatedItems[existingIndex].isOptimistic;
                    } else {
                        // Remove item completely
                        updatedItems.splice(existingIndex, 1);
                    }
                    return updatedItems;
                }
                return prevItems.filter(cartItem => cartItem.cartItemId !== tempId);
            });
        };

        operationQueue.current.set(opId, { rollback, type: 'add' });

        try {
            if (isAuthenticated && user?.id) {
                const cartData = {
                    productId: item.id,
                    variantId: item.variantId || "",
                    color: item.color || "",
                    quantity: item.quantity
                };

                const response = await cartService.addToCart(user.id, cartData);
                
                if (response?.items) {
                    // Success - update with real server data
                    const transformedItems = response.items.map(transformCartItem);
                    setCartItems(transformedItems);
                }
            }

            // Operation successful
            operationQueue.current.delete(opId);
            
            return { success: true, opId };
            
        } catch (error) {
            console.error('Add to cart failed:', error);
            
            // Rollback optimistic update
            rollback();
            
            // Set error state
            setErrors(prev => ({
                ...prev,
                [opId]: {
                    message: error.response?.data?.message || 'Không thể thêm vào giỏ hàng',
                    type: 'add_failed'
                }
            }));

            operationQueue.current.delete(opId);
            
            return { success: false, error: error.message, opId };
            
        } finally {
            setLoadingState(opId, false);
        }
    }, [isAuthenticated, user, transformCartItem, clearError, setLoadingState]);

    // Optimistic remove from cart
    const removeFromCartOptimistic = useCallback(async (cartItemId) => {
        const opId = generateOpId();
        
        clearError(opId);
        setLoadingState(opId, true);

        // Find item to remove for rollback
        const itemToRemove = cartItems.find(item => item.cartItemId === cartItemId);
        if (!itemToRemove) {
            setLoadingState(opId, false);
            return { success: false, error: 'Item not found' };
        }

        // Optimistic update - remove immediately from UI
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));

        // Store rollback function
        const rollback = () => {
            setCartItems(prevItems => {
                const existingIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);
                if (existingIndex === -1) {
                    return [...prevItems, itemToRemove];
                }
                return prevItems;
            });
        };

        operationQueue.current.set(opId, { rollback, type: 'remove' });

        try {
            if (isAuthenticated && user?.id && itemToRemove._id && !itemToRemove._id.startsWith('temp_')) {
                await cartService.removeItem(user.id, itemToRemove._id);
            }

            operationQueue.current.delete(opId);
            return { success: true, opId };
            
        } catch (error) {
            console.error('Remove from cart failed:', error);
            
            // Rollback
            rollback();
            
            setErrors(prev => ({
                ...prev,
                [opId]: {
                    message: 'Không thể xóa sản phẩm khỏi giỏ hàng',
                    type: 'remove_failed'
                }
            }));

            operationQueue.current.delete(opId);
            return { success: false, error: error.message, opId };
            
        } finally {
            setLoadingState(opId, false);
        }
    }, [cartItems, isAuthenticated, user, clearError, setLoadingState]);

    // Optimistic quantity update
    const updateQuantityOptimistic = useCallback(async (cartItemId, newQuantity) => {
        const opId = generateOpId();
        
        clearError(opId);
        setLoadingState(opId, true);

        // Find item for rollback
        const itemToUpdate = cartItems.find(item => item.cartItemId === cartItemId);
        if (!itemToUpdate) {
            setLoadingState(opId, false);
            return { success: false, error: 'Item not found' };
        }

        const oldQuantity = itemToUpdate.quantity;

        // Optimistic update
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.cartItemId === cartItemId 
                    ? { ...item, quantity: newQuantity, isOptimistic: true }
                    : item
            )
        );

        // Store rollback function
        const rollback = () => {
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.cartItemId === cartItemId 
                        ? { ...item, quantity: oldQuantity, isOptimistic: false }
                        : item
                )
            );
        };

        operationQueue.current.set(opId, { rollback, type: 'update' });

        try {
            if (isAuthenticated && user?.id && itemToUpdate._id && !itemToUpdate._id.startsWith('temp_')) {
                await cartService.updateQuantity(user.id, itemToUpdate._id, newQuantity);
            }

            // Remove optimistic flag
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.cartItemId === cartItemId 
                        ? { ...item, isOptimistic: false }
                        : item
                )
            );

            operationQueue.current.delete(opId);
            return { success: true, opId };
            
        } catch (error) {
            console.error('Update quantity failed:', error);
            
            // Rollback
            rollback();
            
            setErrors(prev => ({
                ...prev,
                [opId]: {
                    message: error.response?.data?.message || 'Không thể cập nhật số lượng',
                    type: 'update_failed',
                    availableQuantity: error.response?.data?.availableQuantity
                }
            }));

            operationQueue.current.delete(opId);
            return { success: false, error: error.message, opId };
            
        } finally {
            setLoadingState(opId, false);
        }
    }, [cartItems, isAuthenticated, user, clearError, setLoadingState]);

    // Get cart count
    const getCartCount = useCallback(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    // Check if any operation is loading
    const isAnyLoading = useCallback(() => {
        return Object.values(loading).some(Boolean);
    }, [loading]);

    // Get current errors
    const getCurrentErrors = useCallback(() => {
        return Object.values(errors);
    }, [errors]);

    // Clear all errors
    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
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
    };
};

export default useOptimisticCart; 