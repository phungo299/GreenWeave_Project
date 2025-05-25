import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import personalService from '../../services/personalService';
import imageUtils from '../../utils/imageUtils';
import './OrderList.css';

// Sample product image import
// import productImage from '../../assets/images/product-sample.jpg';

const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Lấy thông tin user từ localStorage
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setCurrentUser(user);
            } catch (err) {
                console.error('Error parsing user data:', err);
                setError('Không thể lấy thông tin người dùng');
            }
        } else {
            setError('Vui lòng đăng nhập để xem đơn hàng');
        }
    }, []);

    // Lấy danh sách đơn hàng
    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser?._id) return;

            try {
                setLoading(true);
                setError(null);
                
                const response = await personalService.getUserOrders(currentUser._id);
                
                if (response && response.data) {
                    setOrders(response.data);
                } else {
                    setOrders([]);
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message || 'Không thể tải danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format trạng thái đơn hàng
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Đang xử lý',
            'shipped': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    };

    // Lấy class CSS cho trạng thái
    const getStatusClass = (status) => {
        const classMap = {
            'pending': 'pending',
            'shipped': 'shipping',
            'delivered': 'delivered',
            'cancelled': 'cancelled'
        };
        return classMap[status] || 'pending';
    };

    // Render loading state
    if (loading) {
        return (
            <div className="personal-orders-container">
                <h2 className="personal-section-title">Đơn hàng</h2>
                <div className="personal-orders-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="personal-orders-container">
                <h2 className="personal-section-title">Đơn hàng</h2>
                <div className="personal-orders-error">
                    <p className="error-message">{error}</p>
                    <button 
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // Render empty state
    if (orders.length === 0) {
        return (
            <div className="personal-orders-container">
                <h2 className="personal-section-title">Đơn hàng</h2>
                <div className="personal-orders-empty">
                    <p>Bạn chưa có đơn hàng nào</p>
                    <button 
                        className="shop-now-button"
                        onClick={() => navigate('/products')}
                    >
                        Mua sắm ngay
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="personal-orders-container">
            <h2 className="personal-section-title">Đơn hàng</h2>  
            <div className="personal-orders-list">
                {orders.map(order => (
                    <div key={order._id} className="personal-order-item">
                        <div className="personal-order-header">
                            <span className="personal-order-id">Đơn hàng #{order._id.slice(-8)}</span>
                            <span className="personal-order-date">
                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        
                        <div className="personal-order-content">
                            {/* Hiển thị sản phẩm đầu tiên trong đơn hàng */}
                            {order.items && order.items.length > 0 && (
                                <div className="personal-order-main-item">
                                    <img 
                                        src={
                                            imageUtils.getProductImageUrl(
                                                order.items[0].productId?.variants?.[0]?.imageUrl,
                                                'thumbnail'
                                            ) || imageUtils.getPlaceholder('product', { width: 80, height: 80 })
                                        } 
                                        alt={order.items[0].productId?.name || 'Sản phẩm'} 
                                        className="personal-order-image" 
                                    />          
                                    <div className="personal-order-details">
                                        <h3 className="personal-order-title">
                                            {order.items[0].productId?.name || 'Sản phẩm'}
                                        </h3>
                                        {order.items[0].color && (
                                            <p className="personal-order-color">Màu: {order.items[0].color}</p>
                                        )}
                                        <p className="personal-order-quantity">x{order.items[0].quantity}</p>
                                        {order.items.length > 1 && (
                                            <p className="personal-order-more">
                                                +{order.items.length - 1} sản phẩm khác
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="personal-order-summary">
                                <p className="personal-order-total">
                                    Tổng: {formatPrice(order.totalAmount)}
                                </p>
                                <div className={`personal-order-status ${getStatusClass(order.status)}`}>
                                    {getStatusText(order.status)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="personal-order-buttons">
                            <button
                                className="personal-order-button detail"
                                onClick={() => navigate(`/personal/orders/${order._id}`)}
                            >
                                Chi tiết
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderList; 