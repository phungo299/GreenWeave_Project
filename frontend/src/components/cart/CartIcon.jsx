import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import cartIcon from '../../assets/icons/cart.png';
import './CartIcon.css';

/**
 * CartIcon Component - Real-time cart count with loading states and animations
 * Features: Optimistic updates, loading indicators, bounce animations
 */
const CartIcon = memo(() => {
    const { 
        getCartCount, 
        isAnyLoading, 
        getCurrentErrors,
        cartItems 
    } = useCart();

    const cartCount = getCartCount();
    const hasErrors = getCurrentErrors().length > 0;
    const hasOptimisticItems = cartItems.some(item => item.isOptimistic);

    return (
        <Link to="/cart" className="cart-icon-container">
            <div className={`cart-icon-wrapper ${isAnyLoading() ? 'loading' : ''}`}>
                <img 
                    src={cartIcon} 
                    alt="Shopping Cart" 
                    className={`cart-icon ${hasErrors ? 'error-state' : ''}`} 
                />
                
                {/* Loading spinner overlay */}
                {isAnyLoading() && (
                    <div className="cart-loading-overlay">
                        <div className="cart-spinner"></div>
                    </div>
                )}
                
                {/* Cart count badge */}
                {cartCount > 0 && (
                    <span 
                        className={`cart-count ${hasOptimisticItems ? 'optimistic' : ''} ${hasErrors ? 'error' : ''}`}
                        key={cartCount} // Force re-render for animation
                    >
                        {cartCount}
                    </span>
                )}
                
                {/* Error indicator */}
                {hasErrors && (
                    <div className="cart-error-indicator" title="Có lỗi xảy ra với giỏ hàng">
                        ⚠️
                    </div>
                )}
                
                {/* Optimistic indicator for debugging */}
                {process.env.NODE_ENV === 'development' && hasOptimisticItems && (
                    <div className="cart-optimistic-indicator" title="Đang xử lý...">
                        ⏳
                    </div>
                )}
            </div>
        </Link>
    );
});

CartIcon.displayName = 'CartIcon';

export default CartIcon; 