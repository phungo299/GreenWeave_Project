import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { filterValidCartItems } from '../utils/stockUtils';
import cartService from '../services/cartService';
import '../assets/css/CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    // Get cart data and functions from context
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        setCartItems,
        isAnyLoading,
        getCurrentErrors,
    } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();
    
    // Local state for UI
    const [selectedItems, setSelectedItems] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const itemsPerPage = 10;

    // Handle window resize for responsive layout
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch cart data from API if user is authenticated
    useEffect(() => {
        const fetchCartData = async () => {
            if (isAuthenticated && user?.id) {
                try {
                    setLoading(true);
                    setError(null);
                    const response = await cartService.getCart(user.id);               
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
                            productId: item.productId,
                            image: item.productId.images && item.productId.images.length > 0 
                                ? item.productId.images[0] 
                                : '/assets/images/placeholder-product.png'
                        }));
                        //console.log("Transformed items:", transformedItems);
                        // Update cart context with server data
                        setCartItems(transformedItems);
                    }
                } catch (err) {
                    console.error('Error fetching cart:', err);
                    setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchCartData();
    }, [isAuthenticated, user, setCartItems]);

    // Initialize selectedItems when cartItems change - START UNSELECTED
    useEffect(() => {
        const initialSelectedItems = {};
        cartItems.forEach(item => {
            initialSelectedItems[item.cartItemId] = false; // Fix: Start with unselected items
        });
        setSelectedItems(initialSelectedItems);
        setSelectAll(false); // Fix: Start with select all unchecked
    }, [cartItems]);

    // Handle quantity change with optimistic updates
    const handleQuantityChange = async (cartItemId, action) => {
        const item = cartItems.find(item => item.cartItemId === cartItemId);
        if (!item) return;        
        
        let newQuantity = item.quantity;       
        if (action === 'increment') {
            // Check stock availability
            if (item.productId && typeof item.productId === 'object') {
                const stockQuantity = item.productId.quantity || 0;
                if (item.quantity >= stockQuantity) {
                    showWarning(`Không thể thêm. Số lượng tối đa có thể đặt là ${stockQuantity}`);
                    return;
                }
            }
            newQuantity += 1;
        } else if (action === 'decrement' && item.quantity > 1) {
            newQuantity -= 1;
        } else {
            return; // No change needed
        }      
        
        // Use optimistic update from CartContext
        try {
            const result = await updateQuantity(cartItemId, newQuantity);
            
            if (result.success) {
                // Optional success feedback for significant changes
                if (Math.abs(newQuantity - item.quantity) > 1) {
                    showSuccess(`Đã cập nhật số lượng thành ${newQuantity}`);
                }
            } else {
                showError(result.error || 'Không thể cập nhật số lượng');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            showError('Có lỗi xảy ra khi cập nhật số lượng');
        }
    };

    // Handle select/deselect single item
    const handleSelectItem = (cartItemId) => {
        setSelectedItems(prevSelected => ({
            ...prevSelected,
            [cartItemId]: !prevSelected[cartItemId]
        }));
        
        // Check if all items are now selected
        const updatedSelected = {
            ...selectedItems,
            [cartItemId]: !selectedItems[cartItemId]
        };
        
        const allSelected = cartItems.every(item => updatedSelected[item.cartItemId]);
        setSelectAll(allSelected);
    };

    // Handle select/deselect all items
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        
        const newSelectedItems = {};
        cartItems.forEach(item => {
            newSelectedItems[item.cartItemId] = newSelectAll;
        });
        
        setSelectedItems(newSelectedItems);
    };

    // Calculate total price of selected items
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            if (selectedItems[item.cartItemId]) {
                return total + (item.price * item.quantity);
            }
            return total;
        }, 0);
    };

    // Count selected items
    const countSelectedItems = () => {
        return Object.values(selectedItems).filter(Boolean).length;
    };

    // Format price as Vietnamese currency
    const formatPrice = (price) => {
        return `${price.toLocaleString('vi-VN')} đ`;
    };

    // Check if item is out of stock
    const isItemOutOfStock = (item) => {
        if (!item.productId || typeof item.productId !== 'object') return false;
        
        // Check stock status string
        if (item.productId.stock === "Hết hàng") return true;
        
        // Check numeric quantity  
        if (item.productId.quantity !== undefined && item.productId.quantity <= 0) return true;
        
        // Check if cart quantity exceeds available stock
        if (item.productId.quantity !== undefined && item.quantity > item.productId.quantity) return true;
        
        return false;
    };

    // Get stock warning message for an item
    const getStockWarning = (item) => {
        if (!item.productId || typeof item.productId !== 'object') return null;
        
        if (item.productId.stock === "Hết hàng") {
            return "Sản phẩm đã hết hàng";
        }
        
        if (item.productId.quantity !== undefined && item.productId.quantity <= 0) {
            return "Sản phẩm đã hết hàng";
        }
        
        if (item.productId.quantity !== undefined && item.quantity > item.productId.quantity) {
            return `Chỉ còn ${item.productId.quantity} sản phẩm`;
        }
        
        return null;
    };

    // Handle item removal with optimistic updates
    const handleRemoveItem = async (cartItemId) => {
        const item = cartItems.find(item => item.cartItemId === cartItemId);
        if (!item) return;

        try {
            setIsDeleting(prev => ({ ...prev, [cartItemId]: true }));
            
            // Use optimistic remove from CartContext
            const result = await removeFromCart(cartItemId);
            
            if (result.success) {
                showSuccess(`Đã xóa "${item.name}" khỏi giỏ hàng`);
                
                // Update selectedItems state to remove the deleted item
                setSelectedItems(prev => {
                    const updated = { ...prev };
                    delete updated[cartItemId];
                    return updated;
                });
                
                // Check if we need to update selectAll state
                const remainingItems = cartItems.filter(i => i.cartItemId !== cartItemId);
                if (remainingItems.length === 0) {
                    setSelectAll(false);
                }
            } else {
                showError(result.error || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
            showError('Có lỗi xảy ra khi xóa sản phẩm');
        } finally {
            setIsDeleting(prev => ({ ...prev, [cartItemId]: false }));
        }
    };

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(cartItems.length / itemsPerPage);

    // Generate pagination buttons
    const paginationButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    className={`cart-pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => paginate(i)}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };
    
    // Handle checkout - only selected items
    const handleCheckout = () => {
        const selectedCartItems = cartItems.filter(item => selectedItems[item.cartItemId]);
        
        if (selectedCartItems.length === 0) {
            showWarning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }

        // STOCK VALIDATION: Check if selected items are still available
        const { validItems, invalidItems } = filterValidCartItems(selectedCartItems);
        
        if (invalidItems.length > 0) {
            // Show specific warnings for out-of-stock items
            invalidItems.forEach(item => {
                showError(`${item.name || 'Sản phẩm'}: ${item.error}`);
            });
            
            // Show summary warning
            showError(`Có ${invalidItems.length} sản phẩm không thể thanh toán. Vui lòng bỏ chọn hoặc xóa các sản phẩm hết hàng.`);
            return;
        }
        
        // All selected items are valid - proceed to payment
        navigate('/payment', { 
            state: { 
                selectedItems: validItems,
                totalAmount: calculateTotal()
            } 
        });
    };

    // Check for global cart loading states
    const globalLoading = isAnyLoading();
    const globalErrors = getCurrentErrors();

    // Add body class for cart-page styling
    useEffect(() => {
        document.body.classList.add('cart-page');
        return () => {
            document.body.classList.remove('cart-page');
        };
    }, []);

    if (loading) {
        return (
            <>
                <Header />
                <div className="cart-container modern">
                    <div className="cart-loading modern">
                        <div className="loading-spinner-large"></div>
                        <p>Đang tải giỏ hàng...</p>
                        {globalLoading && <p className="cart-sub-loading">Đang đồng bộ dữ liệu...</p>}
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="cart-container modern">
                    <div className="cart-error modern">
                        <div className="error-icon">⚠️</div>
                        <h3>Có lỗi xảy ra</h3>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            Thử lại
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="cart-container modern">
                {/* Modern Hero Section */}
                <div className="cart-hero-section">
                    <div className="cart-breadcrumb">
                        <Link to="/" className="breadcrumb-item">Trang chủ</Link>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current">Giỏ hàng</span>
                    </div>
                    <h1 className="cart-title modern">Giỏ hàng của bạn</h1>
                    <div className="cart-progress-indicator">
                        <div className="progress-step active">
                            <span className="step-number">1</span>
                            <span className="step-label">Giỏ hàng</span>
                        </div>
                        <div className="progress-line"></div>
                        <div className="progress-step">
                            <span className="step-number">2</span>
                            <span className="step-label">Thanh toán</span>
                        </div>
                        <div className="progress-line"></div>
                        <div className="progress-step">
                            <span className="step-number">3</span>
                            <span className="step-label">Hoàn thành</span>
                        </div>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    /* Enhanced Empty State */
                    <div className="cart-empty modern">
                        <div className="empty-illustration">
                            <svg viewBox="0 0 200 160" className="empty-cart-svg">
                                {/* Shopping Cart SVG */}
                                <g className="cart-body">
                                    <path d="M45 60h110l-8 40H53z" fill="#e8f5e8" stroke="#4CAF50" strokeWidth="2"/>
                                    <circle cx="70" cy="120" r="8" fill="#4CAF50"/>
                                    <circle cx="130" cy="120" r="8" fill="#4CAF50"/>
                                    <path d="M45 60L35 20H15" stroke="#4CAF50" strokeWidth="2" fill="none"/>
                                </g>
                                {/* Floating Items */}
                                <g className="floating-items">
                                    <circle cx="160" cy="30" r="4" fill="#81C784" opacity="0.7">
                                        <animate attributeName="cy" values="30;20;30" dur="3s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="180" cy="45" r="3" fill="#A5D6A7" opacity="0.6">
                                        <animate attributeName="cy" values="45;35;45" dur="2.5s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="25" cy="40" r="3" fill="#C8E6C9" opacity="0.5">
                                        <animate attributeName="cy" values="40;30;40" dur="2.8s" repeatCount="indefinite"/>
                                    </circle>
                                </g>
                            </svg>
                        </div>
                        
                        <div className="empty-content">
                            <h2 className="empty-title">Giỏ hàng đang trống</h2>
                            <p className="empty-description">
                                Khám phá bộ sưu tập thời trang bền vững của chúng tôi và tìm kiếm những món đồ yêu thích!
                            </p>
                            
                            <div className="empty-actions">
                                <Link to="/products" className="btn-primary modern">
                                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M3 3h2l.4 2m0 0h13.2a1 1 0 0 1 .98 1.2l-1.2 6a1 1 0 0 1-.98.8H8m-3 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                                    </svg>
                                    Khám phá sản phẩm
                                </Link>
                                
                                <Link to="/products" className="btn-secondary modern">
                                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M4 6h16M4 12h16M4 18h16"/>
                                    </svg>
                                    Xem danh mục
                                </Link>
                            </div>

                            {/* Featured Categories */}
                            <div className="featured-categories">
                                <h3>Danh mục phổ biến</h3>
                                <div className="category-grid">
                                    <Link to="/products?category=clothing" className="category-card">
                                        <div className="category-icon">👕</div>
                                        <span>Áo phông</span>
                                    </Link>
                                    <Link to="/products?category=bags" className="category-card">
                                        <div className="category-icon">🎒</div>
                                        <span>Balo</span>
                                    </Link>
                                    <Link to="/products?category=accessories" className="category-card">
                                        <div className="category-icon">🧢</div>
                                        <span>Phụ kiện</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Render dựa trên kích thước màn hình */}
                        {!isMobile ? (
                            /* Desktop Table Layout */
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input 
                                                type="checkbox"
                                                className="cart-checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th>Sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Tổng</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map(item => (
                                        <tr key={item.cartItemId}>
                                            <td>
                                                <input 
                                                    type="checkbox"
                                                    className="cart-checkbox"
                                                    checked={selectedItems[item.cartItemId] || false}
                                                    onChange={() => handleSelectItem(item.cartItemId)}
                                                />
                                            </td>
                                            <td>
                                                <div className="cart-product-cell">
                                                    <img src={item.image} alt={item.name} className="cart-product-image" />
                                                    <div className="cart-product-details">
                                                        <span className={`cart-product-name ${isItemOutOfStock(item) ? 'out-of-stock' : ''}`}>
                                                            {item.name}
                                                        </span>
                                                        {item.title && <span className="cart-product-title">{item.title}</span>}
                                                        <span className="cart-product-color">Color: {item.color}</span>
                                                        {item.size && <span className="cart-product-size">Size: {item.size}</span>}
                                                        {getStockWarning(item) && (
                                                            <span className="cart-stock-warning">⚠️ {getStockWarning(item)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="cart-price">{formatPrice(item.price)}</td>
                                            <td>
                                                <div className="cart-quantity-control">
                                                    <button 
                                                        className="cart-quantity-btn minus"
                                                        onClick={() => handleQuantityChange(item.cartItemId, 'decrement')}
                                                        disabled={item.quantity <= 1 || item.isOptimistic}
                                                    >
                                                        -
                                                    </button>
                                                    <span className={`cart-quantity-value ${item.isOptimistic ? 'optimistic' : ''}`}>
                                                        {item.quantity}
                                                        {item.isOptimistic && <span className="loading-dot">⋯</span>}
                                                    </span>
                                                    <button 
                                                        className="cart-quantity-btn plus"
                                                        onClick={() => handleQuantityChange(item.cartItemId, 'increment')}
                                                        disabled={item.isOptimistic}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="cart-price">{formatPrice(item.price * item.quantity)}</td>
                                            <td>
                                                <button 
                                                    className={`cart-delete-btn ${item.isOptimistic ? 'optimistic' : ''}`}
                                                    onClick={() => handleRemoveItem(item.cartItemId)}
                                                    disabled={isDeleting[item.cartItemId] || item.isOptimistic}
                                                >
                                                    {isDeleting[item.cartItemId] ? 'Đang xóa...' : 
                                                     item.isOptimistic ? 'Đang cập nhật...' : 'Xóa'}
                                                </button>
                                                {globalErrors.some(e => e.cartItemId === item.cartItemId) && (
                                                    <span className="cart-item-error">!</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            /* Mobile Card Layout */
                            <div className="cart-mobile-layout">
                                <div className="cart-mobile-header">
                                    <label className="cart-select-all">
                                        <input 
                                            type="checkbox"
                                            className="cart-checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                        <span>Chọn tất cả</span>
                                    </label>
                                    <span className="cart-items-count">
                                        {cartItems.length} sản phẩm
                                    </span>
                                </div>

                                {currentItems.map(item => (
                                    <div key={item.cartItemId} className="cart-mobile-item">
                                        <div className="cart-mobile-item-header">
                                            <input 
                                                type="checkbox"
                                                className="cart-checkbox"
                                                checked={selectedItems[item.cartItemId] || false}
                                                onChange={() => handleSelectItem(item.cartItemId)}
                                            />
                                            <button 
                                                className="cart-remove-btn"
                                                onClick={() => handleRemoveItem(item.cartItemId)}
                                                disabled={isDeleting[item.cartItemId] || item.isOptimistic}
                                            >
                                                {isDeleting[item.cartItemId] ? 'Đang xóa...' : 
                                                 item.isOptimistic ? 'Đang cập nhật...' : 'Xóa'}
                                            </button>
                                        </div>

                                        <div className="cart-mobile-item-content">
                                            <img src={item.image} alt={item.name} className="cart-product-image" />
                                            <div className="cart-product-details">
                                                <div className={`cart-product-name ${isItemOutOfStock(item) ? 'out-of-stock' : ''}`}>
                                                    {item.name}
                                                </div>
                                                {item.title && <div className="cart-product-title">{item.title}</div>}
                                                <div className="cart-product-color">Màu: {item.color}</div>
                                                {item.size && <div className="cart-product-size">Size: {item.size}</div>}
                                                {getStockWarning(item) && (
                                                    <div className="cart-stock-warning">⚠️ {getStockWarning(item)}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="cart-mobile-item-footer">
                                            <div className="cart-price">{formatPrice(item.price)}</div>
                                            <div className="cart-quantity-control">
                                                <button 
                                                    className="cart-quantity-btn minus"
                                                    onClick={() => handleQuantityChange(item.cartItemId, 'decrement')}
                                                    disabled={item.quantity <= 1 || item.isOptimistic}
                                                >
                                                    -
                                                </button>
                                                <span className={`cart-quantity-value ${item.isOptimistic ? 'optimistic' : ''}`}>
                                                    {item.quantity}
                                                    {item.isOptimistic && <span className="loading-dot">⋯</span>}
                                                </span>
                                                <button 
                                                    className="cart-quantity-btn plus"
                                                    onClick={() => handleQuantityChange(item.cartItemId, 'increment')}
                                                    disabled={item.isOptimistic}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="cart-price">{formatPrice(item.price * item.quantity)}</div>
                                        </div>

                                        {globalErrors.some(e => e.cartItemId === item.cartItemId) && (
                                            <div className="cart-item-error-message">
                                                Có lỗi xảy ra với sản phẩm này
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="cart-pagination">
                                <button 
                                    className={`cart-pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    &lt;
                                </button>                                
                                {paginationButtons()}                                
                                <button 
                                    className={`cart-pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    &gt;
                                </button>
                            </div>
                        )}                       
                        <div className="cart-summary">
                            <div className="cart-summary-content">
                                <div className="cart-summary-text">
                                    Tổng cộng ({countSelectedItems()} sản phẩm)
                                </div>
                                <div className="cart-summary-price">
                                    {formatPrice(calculateTotal())}
                                </div>
                            </div>                       
                            <button 
                                className="cart-checkout-btn" 
                                onClick={handleCheckout}
                                disabled={countSelectedItems() === 0}
                            >
                                Mua hàng
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
};
export default CartPage;