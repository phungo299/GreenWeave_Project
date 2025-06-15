import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import imageUtils from '../../utils/imageUtils';
import SafeImage from '../../components/common/SafeImage';
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
            const userId = currentUser?._id || currentUser?.id;
            if (!userId) {
                setLoading(false);
                setError('Vui lòng đăng nhập để xem đơn hàng');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const response = await orderService.getUserOrders(userId);
                
                // Xử lý response format mới
                if (response && response.success && response.data) {
                    setOrders(response.data);
                } else if (response && response.data) {
                    // Fallback cho format cũ
                    setOrders(response.data);
                } else if (Array.isArray(response)) {
                    // Fallback cho response trực tiếp là array
                    setOrders(response);
                } else {
                    setOrders([]);
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                let errorMessage = 'Không thể tải danh sách đơn hàng';
                
                if (err.message) {
                    errorMessage = err.message;
                } else if (err.status === 0) {
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra xem backend đã chạy chưa.';
                }
                
                setError(errorMessage);
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

    // Format trạng thái đơn hàng (xét thêm paymentMethod)
    const getStatusText = (status, paymentMethod) => {
        if (status === 'pending') {
            return paymentMethod === 'COD' ? 'Chờ xác nhận' : 'Chưa thanh toán';
        }
        if (status === 'confirmed') return 'Chuẩn bị hàng';
        if (status === 'expired') return 'Đã hết hạn';
        if (status === 'shipped') return 'Đang giao hàng';
        if (status === 'delivered') return 'Đã giao hàng';
        if (status === 'cancelled') return 'Đã hủy';
        return status;
    };

    // Lấy class CSS cho trạng thái
    const getStatusClass = (status) => {
        const classMap = {
            'pending': 'pending',
            'confirmed': 'processing',
            'expired': 'expired',
            'shipped': 'shipping',
            'delivered': 'delivered',
            'cancelled': 'cancelled'
        };
        return classMap[status] || 'pending';
    };

    // Xử lý thanh toán lại
    const handleRetryPayment = async (orderId) => {
        try {
            const response = await orderService.retryPayment(orderId);
            if (response && response.data && response.data.checkoutUrl) {
                window.location.href = response.data.checkoutUrl;
            } else if (response && response.checkoutUrl) {
                window.location.href = response.checkoutUrl;
            } else {
                alert('Không thể tạo link thanh toán mới, vui lòng thử lại sau.');
            }
        } catch (err) {
            console.error('Retry payment error:', err);
            alert(err.message || 'Không thể thanh toán lại đơn hàng.');
        }
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
                        {/* Container bên trái: header + content */}
                        <div className="personal-order-left-content">
                            <div className="personal-order-header">
                                <div className="personal-order-id-section">
                                    <span className="personal-order-id">Đơn hàng #{order._id.slice(-8)}</span>
                                    <span className="personal-order-date">
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="personal-order-content">
                                {/* Hiển thị sản phẩm đầu tiên trong đơn hàng */}
                                {order.items && order.items.length > 0 && (
                                    <div className="personal-order-main-item">
                                        <SafeImage 
                                            src={
                                                order.items[0].image ||
                                                order.items[0].productId?.imageUrl ||
                                                imageUtils.getProductImageUrl(order.items[0].productId?.images?.[0], 'thumbnail') ||
                                                order.items[0].productId?.variants?.[0]?.imageUrl ||
                                                imageUtils.getProductImageUrl(
                                                    order.items[0].productId?.variants?.[0]?.imageUrl,
                                                    'thumbnail'
                                                )
                                            } 
                                            alt={order.items[0].productId?.name || 'Sản phẩm'} 
                                            className="personal-order-image"
                                            width={80}
                                            height={80}
                                            placeholderType="product"
                                        />          
                                        <div className="personal-order-details">
                                            <h3 className="personal-order-title">
                                                {order.items[0].productId?.name || 'Sản phẩm'}
                                            </h3>
                                            <div className="personal-order-item-info">
                                                {order.items[0].color && (
                                                    <span className="personal-order-color">Màu: {order.items[0].color}</span>
                                                )}
                                                <span className="personal-order-quantity">Số lượng: {order.items[0].quantity}</span>
                                            </div>
                                            {order.items.length > 1 && (
                                                <p className="personal-order-more">
                                                    +{order.items.length - 1} sản phẩm khác
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Container bên phải: footer */}
                        <div className="personal-order-right-content">
                            <div className="personal-order-footer">
                                <div className="personal-order-summary">
                                    <div className="personal-order-total-section">
                                        <span className="personal-order-total-label">Tổng tiền:</span>
                                        <span className="personal-order-total-amount">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                    <div className={`personal-order-status ${getStatusClass(order.status)}`}>
                                        {getStatusText(order.status, order.paymentMethod)}
                                    </div>
                                </div>
                                
                                <div className="personal-order-actions">
                                    <button
                                        className="personal-order-button detail"
                                        onClick={() => navigate(`/personal/orders/${order._id}`)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    {['expired', 'pending'].includes(order.status) && order.paymentMethod !== 'COD' && (
                                        <button
                                            className="personal-order-button retry"
                                            onClick={() => handleRetryPayment(order._id)}
                                        >
                                            Thanh toán lại
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderList; 