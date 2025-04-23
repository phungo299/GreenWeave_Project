import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import { useCart } from '../context/CartContext';
import '../assets/css/CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    // Get cart data and functions from context
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    
    // Local state for UI
    const [selectedItems, setSelectedItems] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
    const handleQuantityChange = (cartItemId, action) => {
        const item = cartItems.find(item => item.cartItemId === cartItemId);
        if (!item) return;
        
        let newQuantity = item.quantity;
        
        if (action === 'increment') {
            newQuantity += 1;
        } else if (action === 'decrement' && item.quantity > 1) {
            newQuantity -= 1;
        }
        
        updateQuantity(cartItemId, newQuantity);
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
                                                    <span className="cart-product-color">Color: {item.color}</span>
                                                    {item.size && <span className="cart-product-size">Size: {item.size}</span>}
                                                    <button 
                                                        className="cart-remove-btn"
                                                        onClick={() => removeFromCart(item.cartItemId)}
                                                    >
                                                        Xóa Sản Phẩm
                                                    </button>
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