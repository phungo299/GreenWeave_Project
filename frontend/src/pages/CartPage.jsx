import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
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
    const itemsPerPage = 10;

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
        
        // Pass selected items to payment page via state
        navigate('/payment', { 
            state: { 
                selectedItems: selectedCartItems,
                totalAmount: calculateTotal()
            } 
        });
    };

    // Check for global cart loading states
    const globalLoading = isAnyLoading();
    const globalErrors = getCurrentErrors();

    if (loading) {
        return (
            <>
                <Header />
                <div className="cart-container">
                    <h1 className="cart-title">Giỏ hàng</h1>
                    <div className="cart-loading">
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
                <div className="cart-container">
                    <h1 className="cart-title">Giỏ hàng</h1>
                    <div className="cart-error">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="cart-shopping-btn">
                            Tải lại
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
            <div className="cart-container">
                <h1 className="cart-title">Giỏ hàng</h1>               
                {cartItems.length === 0 ? (
                    <div className="cart-empty">
                        <p className="cart-empty-message">Giỏ hàng của bạn đang trống</p>
                        <Link to="/products" className="cart-shopping-btn">Tiếp tục mua sắm</Link>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table Layout */}
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
                                                    <span className="cart-product-name">{item.name}</span>
                                                    {item.title && <span className="cart-product-title">{item.title}</span>}
                                                    <span className="cart-product-color">Color: {item.color}</span>
                                                    {item.size && <span className="cart-product-size">Size: {item.size}</span>}
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

                        {/* Mobile Card Layout */}
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
                                            <div className="cart-product-name">{item.name}</div>
                                            {item.title && <div className="cart-product-title">{item.title}</div>}
                                            <div className="cart-product-color">Màu: {item.color}</div>
                                            {item.size && <div className="cart-product-size">Size: {item.size}</div>}
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