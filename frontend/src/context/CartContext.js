import React, { createContext, useState, useContext, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user, isAuthenticated } = useAuth();
    
    // Load cart from localStorage on mount
    useEffect(() => {
        const fetchCart = async () => {
            // If logged in, prioritize getting the shopping cart from the server
            if (isAuthenticated && user?.id) {
                try {
                    const response = await cartService.getCart(user.id);
                    console.log('Get cart from server: ', response);
                    if (response && response.items && Array.isArray(response.items)) {
                        // Transform API response to match CartContext format
                        const transformedItems = response.items.map(item => ({
                            cartItemId: item._id,
                            _id: item._id, // Keep the database ID for API operations
                            id: item.productId._id,
                            name: item.productId.name,
                            title: item.productId.title || '',
                            color: item.color || item.productId.selectedColor || '',
                            size: item.productId.selectedSize || '',
                            price: item.productId.price,
                            quantity: item.quantity,
                            image: item.productId.images && item.productId.images.length > 0 
                                ? item.productId.images[0] 
                                : '/assets/images/placeholder-product.png'
                        }));                        
                        setCartItems(transformedItems);
                        return; // No need to read from localStorage if it is already retrieved from the server
                    }
                } catch (err) {
                    console.error('Error fetching cart from server:', err);
                    // If there is an error, will fallback to reading from localStorage
                }
            }
            
            // If not logged in or fetch from server fails, read from localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    setCartItems(JSON.parse(savedCart));
                } catch (error) {
                    console.error('Error parsing cart from localStorage:', error);
                    setCartItems([]);
                }
            }
        };       
        fetchCart();
    }, [isAuthenticated, user]);
    
    // Save cart to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);
    
    // Add item to cart - updated to call API if authenticated
    const addToCart = async (item) => {
        // First, update local state for immediate UI response
        const newItem = { ...item, cartItemId: Date.now() };       
        setCartItems(prevItems => {
            // Check if item already exists in cart
            const existingItemIndex = prevItems.findIndex(
                cartItem => cartItem.id === item.id && cartItem.color === item.color && cartItem.size === item.size
            );          
            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + item.quantity
                };
                return updatedItems;
            } else {
                // Add new item if it doesn't exist
                return [...prevItems, newItem];
            }
        });
        
        // If authenticated, also add to server
        if (isAuthenticated && user?.id) {
            try {
                const cartData = {
                    productId: item.id,
                    variantId: item.variantId || "",
                    color: item.color || "",
                    quantity: item.quantity
                };                
                const response = await cartService.addToCart(user.id, cartData);                
                // If successful, we could refresh cart from server, but we'll skip for now
                // as the local state is already updated
                console.log('Item added to cart on server:', response);               
                // Optionally, update the cartItemId with the server-generated ID
                if (response && response.items) {
                    // Find the newly added item in the response
                    const serverItem = response.items.find(
                        sItem => sItem.productId._id === item.id && 
                                sItem.color === (item.color || "") &&
                                sItem.quantity === item.quantity
                    );                    
                    if (serverItem) {
                        // Update the local item with the server ID
                        setCartItems(prevItems => 
                            prevItems.map(prevItem => 
                                prevItem.cartItemId === newItem.cartItemId
                                    ? { ...prevItem, _id: serverItem._id, cartItemId: serverItem._id }
                                    : prevItem
                            )
                        );
                    }
                }
            } catch (error) {
                console.error('Error adding item to cart on server:', error);
                // The item is still in local state, so the user can still see it
                // Could show an error message here if needed
            }
        }
    };
    
    // Remove item from cart - updated to call API if authenticated
    const removeFromCart = async (cartItemId) => {
        // Get the item before removing it
        const itemToRemove = cartItems.find(item => item.cartItemId === cartItemId);      
        // Update local state first
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));        
        // If authenticated and item has server ID, remove from server
        if (isAuthenticated && user?.id && itemToRemove && itemToRemove._id) {
            try {
                await cartService.removeItem(user.id, itemToRemove._id);
            } catch (error) {
                console.error('Error removing item from cart on server:', error);
                // Could show an error message here if needed
            }
        }
    };
    
    // Update item quantity - updated to call API if authenticated
    const updateQuantity = async (cartItemId, quantity) => {
        // Get the item before updating
        const itemToUpdate = cartItems.find(item => item.cartItemId === cartItemId);       
        // Update local state first
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.cartItemId === cartItemId 
                    ? { ...item, quantity } 
                    : item
            )
        );        
        // If authenticated and item has server ID, update on server
        if (isAuthenticated && user?.id && itemToUpdate && itemToUpdate._id) {
            try {
                await cartService.updateQuantity(user.id, itemToUpdate._id, quantity);
            } catch (error) {
                console.error('Error updating quantity on server:', error);
                // Could show an error message here if needed
            }
        }
    };
    
    // Clear cart - updated to call API if authenticated
    const clearCart = async () => {
        // Clear local state first
        setCartItems([]);        
        // If authenticated, clear cart on server
        if (isAuthenticated && user?.id) {
            try {
                await cartService.clearCart(user.id);
            } catch (error) {
                console.error('Error clearing cart on server:', error);
                // Could show an error message here if needed
            }
        }
    };
    
    // Get cart count
    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };
    
    return (
        <CartContext.Provider 
            value={{ 
                cartItems, 
                setCartItems,
                addToCart, 
                removeFromCart, 
                updateQuantity, 
                clearCart,
                getCartCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};