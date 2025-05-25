import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import personalService from "../../services/personalService";
import imageUtils from "../../utils/imageUtils";
import "./OrderDetail.css";

const steps = [
    { label: "Đơn hàng đã được đặt", status: "pending" },
    { label: "Chuẩn bị hàng", status: "processing" },
    { label: "Đang vận chuyển", status: "shipped" },
    { label: "Đã giao", status: "delivered" },
];

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await personalService.getOrderDetail(id);
                
                if (response && response.data) {
                    setOrder(response.data);
                } else {
                    setError('Không tìm thấy đơn hàng');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError(err.message || 'Không thể tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get status step index
    const getStatusStepIndex = (status) => {
        const statusMap = {
            'pending': 0,
            'processing': 1,
            'shipped': 2,
            'delivered': 3,
            'cancelled': -1
        };
        return statusMap[status] || 0;
    };

    // Get payment method display
    const getPaymentMethodDisplay = (method) => {
        const methodMap = {
            'credit_card': 'Thẻ tín dụng',
            'debit_card': 'Thẻ ghi nợ',
            'paypal': 'PayPal',
            'bank_transfer': 'Chuyển khoản',
            'cash_on_delivery': 'Thanh toán khi nhận hàng'
        };
        return methodMap[method] || method;
    };

    // Render loading state
    if (loading) {
        return (
            <div className="personal-order-details-container">
                <div className="personal-order-details-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error || !order) {
        return (
            <div className="personal-order-details-container">
                <div className="personal-order-details-error">
                    <p className="error-message">{error || 'Không tìm thấy đơn hàng'}</p>
                    <button 
                        className="back-button"
                        onClick={() => navigate('/personal/orders')}
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    const statusStepIndex = getStatusStepIndex(order.status);

    return (
        <div className="personal-order-details-container">
            <div className="personal-order-details-header">
                <h2 className="personal-order-details-title">Chi tiết đơn hàng</h2>
                <div className="personal-order-details-id">
                    Mã đơn hàng: <span>#{order._id.slice(-8)}</span>
                </div>
                <div className="personal-order-details-meta">
                    <span>
                        Ngày đặt hàng: <b>{formatDate(order.createdAt)}</b>
                    </span>
                    <span className="personal-order-details-meta-sep">|</span>
                    <span className="personal-order-details-expected">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M12 8v5l4 2" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
                        </svg>
                        {order.estimatedDelivery ? (
                            <>Dự kiến giao hàng: <b>{formatDate(order.estimatedDelivery)}</b></>
                        ) : (
                            <>Trạng thái: <b>{order.status === 'pending' ? 'Đang xử lý' : 
                                order.status === 'processing' ? 'Chuẩn bị hàng' :
                                order.status === 'shipped' ? 'Đang giao hàng' :
                                order.status === 'delivered' ? 'Đã giao hàng' : 'Đã hủy'}</b></>
                        )}
                    </span>
                </div>
            </div>
            <div className="personal-order-details-progress">
                <div className="personal-order-details-progress-line"></div>
                {steps.map((step, idx) => (
                    <div
                        key={idx}
                        className={`personal-order-details-step${idx <= statusStepIndex ? " active" : ""}${idx === 0 ? " first" : ""}${idx === steps.length - 1 ? " last" : ""}`}
                    >
                        <div className="personal-order-details-step-label">{step.label}</div>
                        <div className="personal-order-details-step-dot" />
                        <div className="personal-order-details-step-date">{step.date}</div>
                    </div>
                ))}
            </div>
            <div className="personal-order-details-products">
                {order.items.map((item, idx) => (
                    <div className="personal-order-details-product" key={idx}>
                        <img 
                            src={
                                imageUtils.getProductImageUrl(
                                    item.productId?.variants?.[0]?.imageUrl,
                                    'thumbnail'
                                ) || imageUtils.getPlaceholder('product', { width: 80, height: 80 })
                            } 
                            alt={item.productId?.name || 'Sản phẩm'} 
                            className="personal-order-details-product-img" 
                        />
                        <div className="personal-order-details-product-info">
                            <div className="personal-order-details-product-name">{item.productId?.name || 'Sản phẩm'}</div>
                            <div className="personal-order-details-product-color">Màu: {item.color}</div>
                            <div className="personal-order-details-product-qty">x{item.quantity}</div>
                        </div>
                        <div className="personal-order-details-product-price">{formatPrice(item.price)}</div>
                    </div>
                ))}
            </div>
            <div className="personal-order-details-info">
                <div className="personal-order-details-payment">
                    <div className="personal-order-details-info-title">Thanh toán</div>
                    <div className="personal-order-details-payment-method">
                        {getPaymentMethodDisplay(order.paymentMethod)}
                    </div>
                </div>
                <div className="personal-order-details-shipping">
                    <div className="personal-order-details-info-title">Giao hàng</div>
                    <div className="personal-order-details-shipping-address">
                        Địa chỉ<br />
                        {order.shippingAddress?.streetAddress}<br />
                        {order.shippingAddress?.district && `${order.shippingAddress.district}, `}
                        {order.shippingAddress?.city}<br />
                        {order.shippingAddress?.country}
                        {order.shippingAddress?.zipCode && ` - ${order.shippingAddress.zipCode}`}
                    </div>
                </div>
            </div>
            <div className="personal-order-details-summary">
                <div className="personal-order-details-summary-title">Tóm tắt đơn hàng</div>
                <div className="personal-order-details-summary-row">
                    <span>Giá trị</span>
                    <span>{formatPrice(order.subtotal || 0)}</span>
                </div>
                <div className="personal-order-details-summary-row">
                    <span>Giảm giá</span>
                    <span>{formatPrice(order.discount || 0)}</span>
                </div>
                <div className="personal-order-details-summary-row">
                    <span>Phí Ship</span>
                    <span>{formatPrice(order.shippingFee || 0)}</span>
                </div>
                <div className="personal-order-details-summary-row total">
                    <span>Tổng đơn</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                </div>
            </div>
        </div>
    );
}