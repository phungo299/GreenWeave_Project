import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    
    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                setCartItems([]);
            }
        }
    }, []);
    
    // Save cart to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);
    
    // Add item to cart
    const addToCart = (item) => {
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
                return [...prevItems, { ...item, cartItemId: Date.now() }];
            }
        });
    };
    
    // Remove item from cart
    const removeFromCart = (cartItemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    };
    
    // Update item quantity
    const updateQuantity = (cartItemId, quantity) => {
        setCartItems(prevItems => 
            prevItems.map(item => 
                item.cartItemId === cartItemId 
                    ? { ...item, quantity } 
                    : item
            )
        );
    };
    
    // Clear cart
    const clearCart = () => {
        setCartItems([]);
    };
    
    // Get cart count
    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };
    
    return (
        <CartContext.Provider 
            value={{ 
                cartItems, 
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