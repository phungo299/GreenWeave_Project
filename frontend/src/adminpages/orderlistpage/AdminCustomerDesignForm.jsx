import React from 'react';
import './AdminCustomerDesignForm.css';
import orderService from '../../services/orderService';

// Default placeholder to prevent infinite loop
const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f4f8f4'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdminCustomerDesignForm = ({ open, onClose, design }) => {
    if (!open) return null;

    // Handle image error with fallback to prevent infinite loop
    const handleImageError = (e) => {
        const img = e.target;
        // Prevent infinite loop by checking if already set to placeholder
        if (img.src !== DEFAULT_PLACEHOLDER) {
            img.src = DEFAULT_PLACEHOLDER;
        }
    };

    return (
        <div className="admin-customer-design-form-overlay">
            <div className="admin-customer-design-form-modal">
                <button className="admin-customer-design-form-close" onClick={onClose}>×</button>
                <h2 className="admin-customer-design-form-title">Chi tiết đơn hàng</h2>               
                {/* Order Header */}
                <div className="admin-customer-design-form-header">
                    <img 
                        src={design.productImage || DEFAULT_PLACEHOLDER} 
                        alt={design.productName} 
                        className="admin-customer-design-form-product-img"
                        onError={handleImageError}
                    />
                    <div className="admin-customer-design-form-product-info">
                        <div className="admin-customer-design-form-product-name">{design.productName}</div>
                        <div className="admin-customer-design-form-product-detail">Màu sắc: {design.color}</div>
                        <div className="admin-customer-design-form-product-detail">Số lượng: {design.quantity}</div>
                        <div className="admin-customer-design-form-product-detail">Mã đơn hàng: {design.orderCode}</div>
                        <div className="admin-customer-design-form-product-detail">
                            Trạng thái: 
                            <span style={{ 
                                color: orderService.getStatusColor(design.status),
                                fontWeight: 'bold',
                                marginLeft: '8px'
                            }}>
                                {orderService.getStatusText(design.status)}
                            </span>
                        </div>
                        {design.createdAt && (
                            <div className="admin-customer-design-form-product-detail">
                                Ngày đặt: {orderService.formatDate(design.createdAt)}
                            </div>
                        )}
                    </div>
                    <div className="admin-customer-design-form-product-price">
                        {orderService.formatPrice(design.price)}
                    </div>
                </div>
                {/* Shipping Address */}
                {design.shippingAddress && (
                    <div className="admin-customer-design-form-address">
                        <div className="admin-customer-design-form-section-title">Địa chỉ giao hàng</div>
                        <div className="admin-customer-design-form-address-text">
                            {design.shippingAddress}
                        </div>
                    </div>
                )}
                {/* Order Items */}
                {design.items && design.items.length > 1 && (
                    <div className="admin-customer-design-form-items">
                        <div className="admin-customer-design-form-section-title">Tất cả sản phẩm trong đơn hàng</div>
                        <div className="admin-customer-design-form-items-list">
                            {design.items.map((item, index) => (
                                <div key={index} className="admin-customer-design-form-item">
                                    <img 
                                        src={item.productId?.images?.[0] || item.productId?.imageUrl || DEFAULT_PLACEHOLDER} 
                                        alt={item.productId?.name || 'Sản phẩm'}
                                        className="admin-customer-design-form-item-img"
                                        onError={handleImageError}
                                    />
                                    <div className="admin-customer-design-form-item-info">
                                        <div className="admin-customer-design-form-item-name">
                                            {item.productId?.name || 'Sản phẩm không xác định'}
                                        </div>
                                        <div className="admin-customer-design-form-item-details">
                                            {item.color && <span>Màu: {item.color}</span>}
                                            <span>SL: {item.quantity}</span>
                                            <span>Giá: {orderService.formatPrice(item.unitPrice)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <hr className="admin-customer-design-form-divider" />               
                {/* Custom Design Section */}
                <div className="admin-customer-design-form-content">
                    <div className="admin-customer-design-form-section">
                        <div className="admin-customer-design-form-section-title">Thiết kế tùy chỉnh</div>
                        <div className="admin-customer-design-form-custom-note">
                            {design.text || 'Khách hàng chưa yêu cầu thiết kế tùy chỉnh'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminCustomerDesignForm;