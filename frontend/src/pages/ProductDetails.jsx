import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import '../assets/css/ProductDetails.css';

import starIcon from '../assets/icons/star.png';
import eyeIcon from '../assets/icons/visible-opened-eye-interface-option.png';
import cartIcon from '../assets/icons/cart.png';
import shareIcon from '../assets/icons/share.png';

import capImage from '../assets/images/cap-1.JPG';
import toteBagImage from '../assets/images/recycled-tote-bag-1.jpg';
import tshirtImage from '../assets/images/T-shirt products.jpg';

const ProductDetails = () => {
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Blue');
    const [quantity, setQuantity] = useState(0);
    const [activeRecommendationDot, setActiveRecommendationDot] = useState(0);

    // Size options
    const sizeOptions = ['M', 'L', 'XL'];
  
    // Color options
    const colorOptions = [
        { name: 'Black', class: 'product-details-color-black' },
        { name: 'Dark Green', class: 'product-details-color-darkgreen' },
        { name: 'Mint', class: 'product-details-color-mint' },
        { name: 'Light Mint', class: 'product-details-color-lightmint' }
    ];

    // Recommended products
    const recommendedProducts = [
        {
            id: 1,
            name: 'Túi tote tái chế',
            description: 'Moist but well-drained',
            price: '280,000 đ',
            image: toteBagImage
        },
        {
            id: 2,
            name: 'Mũ lưỡi trai',
            description: 'Moist but well-drained',
            price: '220,000 đ',
            image: capImage
        },
        {
            id: 3,
            name: 'Áo phông',
            description: 'Moist but well-drained',
            price: '300,000 đ',
            image: tshirtImage
        }
    ];
  
    // Handler for size selection
    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };
  
    // Handler for color selection
    const handleColorSelect = (color) => {
        setSelectedColor(color);
    };
  
    // Handler for quantity increment/decrement
    const handleQuantityChange = (action) => {
        if (action === 'increment') {
            setQuantity(quantity + 1);
        } else if (action === 'decrement' && quantity > 0) {
            setQuantity(quantity - 1);
        }
    };
  
    // Handler for adding to cart
    const handleAddToCart = () => {
        if (quantity > 0) {
            console.log('Added to cart:', {
                product: 'Mũ lưỡi trai',
                size: selectedSize,
                color: selectedColor,
                quantity
            });
        // Implement cart functionality here
        }
    };

    // Handler for recommendation dots
    const handleDotClick = (index) => {
        setActiveRecommendationDot(index);
    };

    return (
        <>
            <Header />
            <div className="product-details-container">
                <div className="product-details-wrapper">
                    <div className="product-details-image">
                        <img src={capImage} alt="Mũ lưỡi trai" />
                    </div>    
                    <div className="product-details-info">
                        <h1 className="product-details-title">Mũ lưỡi trai</h1>
                        <div className="product-details-rating">
                            <div className="product-details-stars">
                                <img src={starIcon} alt="star" />
                                <img src={starIcon} alt="star" />
                                <img src={starIcon} alt="star" />
                                <img src={starIcon} alt="star" />
                                <img src={starIcon} alt="star" />
                            </div>
                            <span className="product-details-reviews">(4)</span>
                        </div>
                        <div className="product-details-price">220,000 đ</div>
                        <div className="product-details-viewers">
                            <img src={eyeIcon} alt="viewers" />
                            <span>24 người đã xem qua sản phẩm</span>
                        </div>           
                        <div className="product-details-size-section">
                            <div className="product-details-size-title">
                                Size: <span className="product-details-size-value">{selectedSize}</span>
                            </div>
                            <div className="product-details-size-options">
                                {sizeOptions.map((size) => (
                                    <div 
                                        key={size} 
                                        className={`product-details-size-option ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => handleSizeSelect(size)}
                                    >
                                        {size}
                                    </div>
                                ))}
                            </div>
                        </div>     
                        <div className="product-details-color-section">
                            <div className="product-details-color-title">
                                Color: <span className="product-details-size-value">{selectedColor}</span>
                            </div>
                            <div className="product-details-color-options">
                                {colorOptions.map((color) => (
                                    <div 
                                        key={color.name} 
                                        className={`product-details-color-option ${color.class} ${selectedColor === color.name ? 'active' : ''}`}
                                        onClick={() => handleColorSelect(color.name)}
                                    ></div>
                                ))}
                            </div>
                        </div>          
                        <div className="product-details-quantity">
                            <div className="product-details-quantity-control">
                                <button 
                                    className="product-details-quantity-btn" 
                                    onClick={() => handleQuantityChange('decrement')}
                                >
                                    -
                                </button>
                                <input 
                                    type="text" 
                                    className="product-details-quantity-value" 
                                    value={quantity.toString().padStart(2, '0')} 
                                    readOnly 
                                />
                                <button 
                                    className="product-details-quantity-btn" 
                                    onClick={() => handleQuantityChange('increment')}
                                >
                                    +
                                </button>
                            </div>
                        </div>      
                        <div className="product-details-actions">
                            <button className="product-details-add-to-cart-btn" onClick={handleAddToCart}>
                                <img src={cartIcon} alt="cart" style={{ width: '20px', marginRight: '10px', filter: 'brightness(0) saturate(100%) invert(22%) sepia(27%) saturate(606%) hue-rotate(111deg) brightness(93%) contrast(87%)' }} />
                                Thêm vào giỏ hàng
                            </button>
                            <button className="product-details-buy-btn" onClick={handleAddToCart}>
                                Mua hàng
                            </button>
                            <button className="product-details-share-btn">
                                <img src={shareIcon} alt="share" style={{ width: '20px' }} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="product-details-description-container">
                    <div className="product-details-description-row">
                        <div className="product-details-description-cell">
                            <h3 className="product-details-description-title">Mô tả sản phẩm</h3>
                        </div>
                        <div className="product-details-description-cell">
                            <p className="product-details-description-content">
                                GreenWeave được thành lập với sứ mệnh thay đổi ngành 
                                công nghiệp thời trang thông qua các sản phẩm thân thiện với 
                                môi trường. Chúng tôi sử dụng vải nhựa tái chế và các vật liệu 
                                bền vững để tạo ra những sản phẩm thời trang chất lượng cao 
                                mà không gây hại cho hành tinh.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <section className="product-recommendations">
                <div className="product-recommendations-container">
                    <h2 className="product-recommendations-title">Đề xuất</h2>
                    <div className="product-recommendations-grid">
                        {recommendedProducts.map((product) => (
                            <Link to={`/products/${product.id}`} key={product.id} className="recommendation-card">
                                <div className="recommendation-image-container">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="recommendation-image" 
                                    />
                                </div>
                                <div className="recommendation-info">
                                    <h3 className="recommendation-name">{product.name}</h3>
                                    <p className="recommendation-description">{product.description}</p>
                                    <p className="recommendation-price">{product.price}</p>
                                </div>
                                <button className="recommendation-button">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <path d="M9 18l6-6-6-6"/>
                                    </svg>
                                </button>
                            </Link>
                        ))}
                    </div>
                    <div className="recommendation-dots">
                        {[0, 1, 2, 3].map((index) => (
                            <button 
                                key={index} 
                                className={`recommendation-dot ${activeRecommendationDot === index ? 'active' : ''}`}
                                onClick={() => handleDotClick(index)}
                                aria-label={`Recommendation page ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};
export default ProductDetails;
