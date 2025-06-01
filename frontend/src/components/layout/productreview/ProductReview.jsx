import React, { useState, useEffect } from 'react';
import { FaStar, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import reviewService from '../../../services/reviewService';
import './ProductReview.css';

const ProductReview = ({ productId }) => {
    const { isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: '',
    });
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);

    // Load reviews when component mounts or productId changes
    useEffect(() => {
        if (!productId) return;
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await reviewService.getProductReviews(productId);        
                if (response) {
                    // Sort reviews with newest first
                    const sortedReviews = response.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setReviews(sortedReviews);          
                    // Check if user has already reviewed this product
                    if (isAuthenticated && user) {
                        const existingReview = sortedReviews.find(
                            review => review.userId._id === user.id
                        );
                        if (existingReview) {
                            setUserReview(existingReview);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching product reviews:', err);
                setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId, isAuthenticated, user]);

    // Scroll to form when editing starts
    useEffect(() => {
        if (isEditing) {
            // Use setTimeout to ensure the form is rendered before scrolling
            setTimeout(() => {
                const formElement = document.querySelector('.product-review-form-container');
                if (formElement) {
                    formElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 100);
        }
    }, [isEditing]);

    // Handle star rating click
    const handleRatingClick = (rating) => {
        setNewReview({ ...newReview, rating });
    };

    // Handle mouse enter on stars
    const handleStarHover = (rating) => {
        setHoveredRating(rating);
    };

    // Handle mouse leave on stars
    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    // Handle comment change
    const handleCommentChange = (e) => {
        setNewReview({ ...newReview, comment: e.target.value });
    };

    // Handle review submission
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setError('Vui lòng đăng nhập để đánh giá sản phẩm');
            return;
        }
        if (newReview.rating === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            return;
        }
        try {
            setSubmitLoading(true);
            setError(null);           
            const reviewData = {
                userId: user.id,
                productId: productId,
                rating: newReview.rating,
                comment: newReview.comment
            };           
            let response;   
            if (isEditing && editingReviewId) {
                // Update existing review
                response = await reviewService.updateReview(editingReviewId, {
                    rating: newReview.rating,
                    comment: newReview.comment
                });
                // Update the review in the reviews array
                setReviews(reviews.map(review => 
                    review._id === editingReviewId ? response : review
                ));
                setUserReview(response);
                setIsEditing(false);
                setEditingReviewId(null);
            } else {
                // Create new review
                response = await reviewService.createReview(reviewData);
                // Add the new review to the reviews array
                setReviews([response, ...reviews]);
                setUserReview(response);
            }           
            // Reset form
            setNewReview({
                rating: 0,
                comment: ''
            });            
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.message || 'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Handle edit review - load review data to form
    const handleEditReview = (review) => {
        setIsEditing(true);
        setEditingReviewId(review._id);
        setNewReview({
            rating: review.rating,
            comment: review.comment
        });
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingReviewId(null);
        setNewReview({
            rating: 0,
            comment: ''
        });
    };

    // Handle delete review
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            return;
        }
        try {
            setSubmitLoading(true);
            await reviewService.deleteReview(reviewId);
            // Remove the review from the reviews array
            setReviews(reviews.filter(review => review._id !== reviewId));
            setUserReview(null);
            // Reset form if currently editing this review
            if (editingReviewId === reviewId) {
                setIsEditing(false);
                setEditingReviewId(null);
                setNewReview({ rating: 0, comment: '' });
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            setError('Đã xảy ra lỗi khi xóa đánh giá. Vui lòng thử lại sau.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Check if user can write a review (hasn't reviewed yet or is editing)
    const canWriteReview = !userReview || isEditing;

    return (
        <div className="product-review-container">
            <h2 className="product-review-title">Đánh giá sản phẩm</h2>            
            {/* Review Form - Only show if user can write review */}
            {isAuthenticated && canWriteReview ? (
                <div className="product-review-form-container">
                    <h3 className="product-review-form-title">
                        {isEditing ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá'}
                    </h3>
                    <form onSubmit={handleSubmitReview} className="product-review-form">
                        <div className="product-review-rating">
                            <p>Đánh giá của bạn:</p>
                            <div className="product-review-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={`product-review-star ${
                                            star <= (hoveredRating || newReview.rating) ? 'active' : ''
                                        }`}
                                        onClick={() => handleRatingClick(star)}
                                        onMouseEnter={() => handleStarHover(star)}
                                        onMouseLeave={handleStarLeave}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="product-review-comment">
                            <label htmlFor="comment" className="product-review-comment-label">
                                Nhận xét của bạn
                            </label>
                            <textarea
                                id="comment"
                                name="comment"
                                value={newReview.comment}
                                onChange={handleCommentChange}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                className="product-review-comment-textarea"
                                rows={4}
                                maxLength={1000}
                            />
                        </div>
                        {error && <div className="product-review-error">{error}</div>}
                        <div className="product-review-actions">
                            <button 
                                type="submit" 
                                className="product-review-submit-btn"
                                disabled={submitLoading}
                            >
                                {submitLoading ? (
                                    <FaSpinner className="product-review-spinner" />
                                ) : isEditing ? (
                                    'Cập nhật đánh giá'
                                ) : (
                                    'Gửi đánh giá'
                                )}
                            </button>
                            {isEditing && (
                                <button 
                                    type="button" 
                                    className="product-review-cancel-btn"
                                    onClick={handleCancelEdit}
                                >
                                    Hủy
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            ) : !isAuthenticated ? (
                <div className="product-review-login-prompt">
                    <p>Vui lòng <a href="/login">đăng nhập</a> để đánh giá sản phẩm</p>
                </div>
            ) : userReview ? (
                <div className="product-review-already-reviewed">
                    <p>Bạn đã đánh giá sản phẩm này. Xem đánh giá của bạn bên dưới.</p>
                </div>
            ) : null}          
            {/* Reviews List */}
            <div className="product-review-list-container">
                <h3 className="product-review-list-title">
                    {reviews.length > 0 
                        ? `Tất cả đánh giá (${reviews.length})` 
                        : 'Chưa có đánh giá nào'}
                </h3>
                {loading ? (
                    <div className="product-review-loading">
                        <FaSpinner className="product-review-spinner" />
                        <p>Đang tải đánh giá...</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <ul className="product-review-list">
                        {reviews.map((review) => (
                            <li key={review._id} className="product-review-item">
                                <div className="product-review-item-header">
                                    <div className="product-review-item-user">
                                        <img 
                                            src={review.userId.avatar || '/assets/images/default-avatar.png'} 
                                            alt={review.userId.username} 
                                            className="product-review-item-avatar"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/assets/images/default-avatar.png';
                                            }}
                                        />
                                        <div>
                                            <h4 className="product-review-item-username">
                                                {review.userId.username}
                                                {user && review.userId._id === user.id && (
                                                    <span className="product-review-item-current-user"> (Bạn)</span>
                                                )}
                                            </h4>
                                            <p className="product-review-item-date">
                                                {formatDate(review.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="product-review-item-rating-container">
                                        <div className="product-review-item-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar
                                                    key={i}
                                                    className={`product-review-item-star ${
                                                        i < review.rating ? 'active' : ''
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="product-review-item-comment">{review.comment}</p>
                                {/* Show edit/delete buttons for user's own review */}
                                {user && review.userId._id === user.id && (
                                    <div className="product-review-item-actions">
                                        <button 
                                            type="button" 
                                            className="product-review-edit-btn"
                                            onClick={() => handleEditReview(review)}
                                            disabled={submitLoading}
                                        >
                                            <FaEdit /> Sửa
                                        </button>
                                        <button 
                                            type="button" 
                                            className="product-review-delete-btn"
                                            onClick={() => handleDeleteReview(review._id)}
                                            disabled={submitLoading}
                                        >
                                            <FaTrash /> Xóa
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="product-review-empty">
                        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                        {isAuthenticated && (
                            <p>Hãy trở thành người đầu tiên đánh giá sản phẩm này!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProductReview;