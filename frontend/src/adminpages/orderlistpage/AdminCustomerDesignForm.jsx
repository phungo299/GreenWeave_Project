import React from 'react';
import './AdminCustomerDesignForm.css';

const AdminCustomerDesignForm = ({ open, onClose, design }) => {
    if (!open) return null;

    return (
        <div className="admin-customer-design-form-overlay">
            <div className="admin-customer-design-form-modal">
                <button className="admin-customer-design-form-close" onClick={onClose}>×</button>
                <h2 className="admin-customer-design-form-title">Thiết kế của khách hàng</h2>
                <div className="admin-customer-design-form-header">
                    <img src={design.productImage} alt={design.productName} className="admin-customer-design-form-product-img" />
                    <div className="admin-customer-design-form-product-info">
                        <div className="admin-customer-design-form-product-name">{design.productName}</div>
                        <div className="admin-customer-design-form-product-detail">Color: {design.color}</div>
                        <div className="admin-customer-design-form-product-detail">X {design.quantity}</div>
                        <div className="admin-customer-design-form-product-detail">Mã đơn hàng: {design.orderCode}</div>
                    </div>
                    <div className="admin-customer-design-form-product-price">
                        {design.price.toLocaleString()} đ
                    </div>
                </div>
                <hr className="admin-customer-design-form-divider" />
                <div className="admin-customer-design-form-content">
                    <div className="admin-customer-design-form-section">
                        <div className="admin-customer-design-form-section-title">Màu sắc</div>
                        <img src={design.colorImage} alt="Màu sắc" className="admin-customer-design-form-section-img" />
                    </div>
                    <div className="admin-customer-design-form-section">
                        <div className="admin-customer-design-form-section-title">Chữ</div>
                        {design.textImage ? (
                            <img
                                src={design.textImage}
                                alt="Chữ"
                                className="admin-customer-design-form-section-img"
                            />
                        ) : (
                            <div className="admin-customer-design-form-section-text">{design.text}</div>
                        )}
                    </div>
                    <div className="admin-customer-design-form-section">
                        <div className="admin-customer-design-form-section-title">Họa Tiết</div>
                        <img src={design.patternImage} alt="Họa tiết" className="admin-customer-design-form-section-img" />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminCustomerDesignForm;