import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import personalService from "../../services/personalService";
import imageUtils from "../../utils/imageUtils";
import "./FavoriteList.css";

export default function FavoriteList() {
    const navigate = useNavigate();
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});

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
            setError('Vui lòng đăng nhập để xem danh sách yêu thích');
        }
    }, []);

    // Lấy danh sách yêu thích
    useEffect(() => {
        const fetchWishlist = async () => {
            const userId = currentUser?._id || currentUser?.id;
            if (!userId) {
                setLoading(false);
                setError('Vui lòng đăng nhập để xem danh sách yêu thích');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const response = await personalService.getWishlist(userId);
                
                if (response && response.data) {
                    setFavoriteProducts(response.data);
                } else {
                    setFavoriteProducts([]);
                }
            } catch (err) {
                console.error('Error fetching wishlist:', err);
                setError(err.message || 'Không thể tải danh sách yêu thích');
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [currentUser]);

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Xóa sản phẩm khỏi danh sách yêu thích
    const handleRemoveFromWishlist = async (itemId) => {
        const userId = currentUser?._id || currentUser?.id;
        if (!userId) return;

        try {
            await personalService.removeFromWishlist(userId, itemId);
            
            // Cập nhật state local
            setFavoriteProducts(prev => prev.filter(item => item._id !== itemId));
            
            // Hiển thị thông báo thành công
            alert('Đã xóa sản phẩm khỏi danh sách yêu thích');
        } catch (err) {
            console.error('Error removing from wishlist:', err);
            alert('Không thể xóa sản phẩm khỏi danh sách yêu thích');
        }
    };

    // Thêm vào giỏ hàng
    const handleAddToCart = async (item) => {
        const userId = currentUser?._id || currentUser?.id;
        if (!userId) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            return;
        }

        try {
            setAddingToCart(prev => ({ ...prev, [item._id]: true }));

            const cartData = {
                productId: item.productId._id,
                variantId: item.productId.variants?.[0]?.variantId || '',
                color: item.color || item.productId.variants?.[0]?.color || '',
                quantity: 1
            };

            await personalService.addToCart(userId, cartData);
            
            alert('Đã thêm sản phẩm vào giỏ hàng');
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Không thể thêm sản phẩm vào giỏ hàng');
        } finally {
            setAddingToCart(prev => ({ ...prev, [item._id]: false }));
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="personal-favorite-list-container">
                <h2 className="personal-favorite-list-title">Sản phẩm yêu thích</h2>
                <div className="personal-favorite-list-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách yêu thích...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="personal-favorite-list-container">
                <h2 className="personal-favorite-list-title">Sản phẩm yêu thích</h2>
                <div className="personal-favorite-list-error">
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
    if (favoriteProducts.length === 0) {
        return (
            <div className="personal-favorite-list-container">
                <h2 className="personal-favorite-list-title">Sản phẩm yêu thích</h2>
                <div className="personal-favorite-list-empty">
                    <p>Bạn chưa có sản phẩm yêu thích nào</p>
                    <button 
                        className="shop-now-button"
                        onClick={() => navigate('/products')}
                    >
                        Khám phá sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="personal-favorite-list-container">
            <h2 className="personal-favorite-list-title">Sản phẩm yêu thích</h2>
            <div className="personal-favorite-list-list">
                {favoriteProducts.map((item) => (
                    <div className="personal-favorite-list-item" key={item._id}>
                        <button 
                            className="personal-favorite-list-remove-btn"
                            onClick={() => handleRemoveFromWishlist(item._id)}
                            title="Xóa khỏi danh sách yêu thích"
                        >
                            ×
                        </button>
                        
                        <img
                            src={
                                imageUtils.getProductImageUrl(
                                    item.productId?.variants?.find(v => v.color === item.color)?.imageUrl ||
                                    item.productId?.variants?.[0]?.imageUrl,
                                    'small'
                                ) || imageUtils.getPlaceholder('product', { width: 100, height: 100 })
                            }
                            alt={item.productId?.name || 'Sản phẩm'}
                            className="personal-favorite-list-image"
                            onClick={() => navigate(`/products/${item.productId?._id}`)}
                        />
                        
                        <div className="personal-favorite-list-info">
                            <div 
                                className="personal-favorite-list-name"
                                onClick={() => navigate(`/products/${item.productId?._id}`)}
                            >
                                {item.productId?.name || 'Sản phẩm'}
                            </div>
                            {item.color && (
                                <div className="personal-favorite-list-color">
                                    Màu: {item.color}
                                </div>
                            )}
                            <div className="personal-favorite-list-rating">
                                {item.productId?.rating && (
                                    <span>⭐ {item.productId.rating.toFixed(1)}</span>
                                )}
                                {item.productId?.reviewCount && (
                                    <span> ({item.productId.reviewCount} đánh giá)</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="personal-favorite-list-actions">
                            <div className="personal-favorite-list-price">
                                {formatPrice(item.productId?.price || 0)}
                            </div>
                            <button 
                                className={`personal-favorite-list-add-btn ${addingToCart[item._id] ? 'loading' : ''}`}
                                onClick={() => handleAddToCart(item)}
                                disabled={addingToCart[item._id]}
                            >
                                {addingToCart[item._id] ? 'Đang thêm...' : '+ Giỏ hàng'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}