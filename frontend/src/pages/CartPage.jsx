import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import cartService from '../services/cartService';
import '../assets/css/CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    // Get cart data and functions from context
    const { cartItems, removeFromCart, updateQuantity, setCartItems } = useCart();
    const { user, isAuthenticated } = useAuth();
    
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

    // Initialize selectedItems when cartItems change
    useEffect(() => {
        const initialSelectedItems = {};
        cartItems.forEach(item => {
            initialSelectedItems[item.cartItemId] = true;
        });
        setSelectedItems(initialSelectedItems);
        setSelectAll(cartItems.length > 0);
    }, [cartItems]);

    // Handle quantity change
    const handleQuantityChange = async (cartItemId, action) => {
        const item = cartItems.find(item => item.cartItemId === cartItemId);
        if (!item) return;        
        let newQuantity = item.quantity;       
        if (action === 'increment') {
            //console.log('Item check:', item);
            if (!item.productId) {
                console.error('Product ID is undefined', item);
                return;
            }
            // Check if the new quantity exceeds the stock quantity
            const stockQuantity = typeof item.productId === 'object' ? 
                (item.productId.quantity || 0) : 0;
            //console.log('Stock quantity:', stockQuantity, 'Item:', item.productId);
            if (item.quantity >= stockQuantity) {
                alert(`Không thể thêm. Số lượng tối đa có thể đặt là ${stockQuantity}`);
                return;
            }
            newQuantity += 1;
        } else if (action === 'decrement' && item.quantity > 1) {
            newQuantity -= 1;
        }      
        // Update quantity in local state first for fast UI response
        updateQuantity(cartItemId, newQuantity);       
        // If logged in, call API to update quantity on server
        if (isAuthenticated && user?.id && item._id) {
            try {
                await cartService.updateQuantity(user.id, item._id, newQuantity);
            } catch (error) {
                console.error('Error updating quantity on server:', error);               
                // If the error is due to exceeding the inventory quantity
                if (error.response && error.response.status === 400) {
                    const availableQuantity = error.response.data.availableQuantity;                  
                    // Display a message to the user
                    alert(`Số lượng vượt quá số lượng tồn kho. Số lượng tối đa có thể đặt là ${availableQuantity}`);                   
                    // Undo local changes and update to correct available quantity
                    updateQuantity(cartItemId, Math.min(newQuantity, availableQuantity));
                } else {
                    // Other errors, display general message
                    alert('Không thể cập nhật số lượng. Vui lòng thử lại sau.');                  
                    // Undo local changes
                    updateQuantity(cartItemId, item.quantity);
                }
            }
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

    // Handle item removal with API call if user is authenticated
    const handleRemoveItem = async (cartItemId) => {
        try {
            setIsDeleting(prev => ({ ...prev, [cartItemId]: true }));           
            // Get the item to find its database ID if available
            const item = cartItems.find(item => item.cartItemId === cartItemId);          
            // If authenticated and item has a database ID, delete from server
            if (isAuthenticated && user?.id && item && item._id) {
                await cartService.removeItem(user.id, item._id);
            }       
            // Always remove from local storage
            removeFromCart(cartItemId);            
        } catch (error) {
            console.error('Failed to remove item:', error);
            alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
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
    
    // Handle checkout
    const handleCheckout = () => {
        navigate('/payment');
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="cart-container">
                    <h1 className="cart-title">Giỏ hàng</h1>
                    <div className="cart-loading">
                        <p>Đang tải giỏ hàng...</p>
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
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="cart-quantity-value">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    className="cart-quantity-btn plus"
                                                    onClick={() => handleQuantityChange(item.cartItemId, 'increment')}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="cart-price">{formatPrice(item.price * item.quantity)}</td>
                                        <td>
                                            <button 
                                                className="cart-delete-btn"
                                                onClick={() => handleRemoveItem(item.cartItemId)}
                                                disabled={isDeleting[item.cartItemId]}
                                            >
                                                {isDeleting[item.cartItemId] ? 'Đang xóa...' : 'Xóa'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>                        
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
                            <div className="cart-summary-text">
                                Tổng cộng ({countSelectedItems()} sản phẩm)
                            </div>
                            <div className="cart-summary-price">
                                {formatPrice(calculateTotal())}
                            </div>
                        </div>                       
                        <button className="cart-checkout-btn" onClick={handleCheckout}>
                            Mua hàng
                        </button>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
};
export default CartPage;