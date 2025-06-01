import React from 'react';
import './ReviewDetailModal.css';

const ReviewDetailModal = ({ review, isOpen, onClose, loading }) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <span 
                key={index} 
                className={`review-detail-star ${index < rating ? 'filled' : ''}`}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="review-detail-modal-overlay" onClick={onClose}>
            <div className="review-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="review-detail-modal-header">
                    <h2 className="review-detail-modal-title">Chi tiết đánh giá</h2>
                    <button 
                        className="review-detail-modal-close-btn"
                        onClick={onClose}
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="review-detail-modal-loading">
                        <div className="review-detail-spinner">⏳</div>
                        <p>Đang tải thông tin đánh giá...</p>
                    </div>
                ) : review ? (
                    <div className="review-detail-modal-body">
                        {/* User Information */}
                        <div className="review-detail-section">
                            <h3 className="review-detail-section-title">👤 Thông tin người dùng</h3>
                            <div className="review-detail-user-info">
                                <div className="review-detail-user-avatar">
                                    {review.userId?.avatar ? (
                                        <img 
                                            src={review.userId.avatar} 
                                            alt={review.userId.username}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/assets/images/default-avatar.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="review-detail-default-avatar">
                                            {review.userId?.username?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="review-detail-user-details">
                                    <div className="review-detail-info-row">
                                        <span className="review-detail-label">Tên người dùng:</span>
                                        <span className="review-detail-value">{review.userId?.username || 'N/A'}</span>
                                    </div>
                                    {review.userId?.fullName && (
                                        <div className="review-detail-info-row">
                                            <span className="review-detail-label">Họ và tên:</span>
                                            <span className="review-detail-value">{review.userId.fullName}</span>
                                        </div>
                                    )}
                                    <div className="review-detail-info-row">
                                        <span className="review-detail-label">Email:</span>
                                        <span className="review-detail-value">{review.userId?.email || 'N/A'}</span>
                                    </div>
                                    {review.userId?.phone && (
                                        <div className="review-detail-info-row">
                                            <span className="review-detail-label">Số điện thoại:</span>
                                            <span className="review-detail-value">{review.userId.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="review-detail-section">
                            <h3 className="review-detail-section-title">📦 Thông tin sản phẩm</h3>
                            <div className="review-detail-product-info">
                                {review.productId?.images?.[0] && (
                                    <div className="review-detail-product-image">
                                        <img 
                                            src={review.productId.images[0]} 
                                            alt={review.productId.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/assets/images/default-product.png';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="review-detail-product-details">
                                    <div className="review-detail-info-row">
                                        <span className="review-detail-label">Tên sản phẩm:</span>
                                        <span className="review-detail-value">{review.productId?.name || 'N/A'}</span>
                                    </div>
                                    {review.productId?.title && (
                                        <div className="review-detail-info-row">
                                            <span className="review-detail-label">Tiêu đề:</span>
                                            <span className="review-detail-value">{review.productId.title}</span>
                                        </div>
                                    )}
                                    {review.productId?.productCode && (
                                        <div className="review-detail-info-row">
                                            <span className="review-detail-label">Mã sản phẩm:</span>
                                            <span className="review-detail-value review-detail-product-code">
                                                #{review.productId.productCode}
                                            </span>
                                        </div>
                                    )}
                                    {review.productId?.price && (
                                        <div className="review-detail-info-row">
                                            <span className="review-detail-label">Giá:</span>
                                            <span className="review-detail-value review-detail-price">
                                                {review.productId.price.toLocaleString('vi-VN')}₫
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Review Information */}
                        <div className="review-detail-section">
                            <h3 className="review-detail-section-title">⭐ Nội dung đánh giá</h3>
                            <div className="review-detail-review-info">
                                <div className="review-detail-rating-section">
                                    <div className="review-detail-info-row">
                                        <span className="review-detail-label">Đánh giá:</span>
                                        <div className="review-detail-rating">
                                            {renderStars(review.rating)}
                                            <span className="review-detail-rating-text">
                                                ({review.rating}/5 sao)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="review-detail-comment-section">
                                    <div className="review-detail-info-row">
                                        <span className="review-detail-label">Nhận xét:</span>
                                    </div>
                                    <div className="review-detail-comment">
                                        {review.comment ? (
                                            <p>"{review.comment}"</p>
                                        ) : (
                                            <p className="review-detail-no-comment">Không có nhận xét</p>
                                        )}
                                    </div>
                                </div>

                                <div className="review-detail-dates">
                                    <div className="review-detail-info-row">
                                        <span className="review-detail-label">Ngày tạo:</span>
                                        <span className="review-detail-value">{formatDate(review.createdAt)}</span>
                                    </div>
                                    {review.updatedAt && review.updatedAt !== review.createdAt && (
                                        <div className="review-detail-info-row">
                                            <span className="review-detail-label">Ngày cập nhật:</span>
                                            <span className="review-detail-value">{formatDate(review.updatedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="review-detail-modal-error">
                        <p>❌ Không thể tải thông tin đánh giá</p>
                    </div>
                )}

                <div className="review-detail-modal-footer">
                    <button 
                        className="review-detail-modal-close-footer-btn"
                        onClick={onClose}
                        type="button"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ReviewDetailModal; 