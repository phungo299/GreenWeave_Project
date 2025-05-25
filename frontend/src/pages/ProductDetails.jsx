import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import { useCart } from '../context/CartContext';
import AnimatedSection from '../components/common/AnimatedSection';
import '../assets/css/ProductDetails.css';

import starIcon from '../assets/icons/star.png';
import eyeIcon from '../assets/icons/visible-opened-eye-interface-option.png';
import cartIcon from '../assets/icons/cart.png';
import shareIcon from '../assets/icons/share.png';

import capImage from '../assets/images/cap-1.JPG';
import toteBagImage from '../assets/images/recycled-tote-bag-1.jpg';
import tshirtImage from '../assets/images/T-shirt products.jpg';

const ProductDetails = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Blue');
    const [quantity, setQuantity] = useState(1); // Default to 1 instead of 0
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
        } else if (action === 'decrement' && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
  
    // Handler for adding to cart
    const handleAddToCart = () => {
        if (quantity > 0) {
            const productToAdd = {
                id: 1, // In a real app, this would be a real product ID
                name: 'Mũ lưỡi trai',
                color: selectedColor,
                size: selectedSize,
                price: 220000, // In a real app, this would come from the product data
                quantity: quantity,
                image: capImage
            };
            
            addToCart(productToAdd);
            
            // Optional: Show a toast or confirmation message
            alert('Sản phẩm đã được thêm vào giỏ hàng!');
        }
    };
    
    // Handler for direct buying
    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    // Handler for recommendation dots
    const handleDotClick = (index) => {
        setActiveRecommendationDot(index);
    };

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Header />
            <div className="product-details-container">
                <AnimatedSection animation="fadeIn" duration={0.8}>
                    <div className="product-details-wrapper">
                        <AnimatedSection animation="slideRight" delay={0.2} className="product-details-image">
                            <img src={capImage} alt="Mũ lưỡi trai" />
                        </AnimatedSection>    
                        <AnimatedSection animation="slideLeft" delay={0.4} className="product-details-info">
                            <AnimatedSection animation="slideUp" delay={0.6}>
                                <h1 className="product-details-title">Mũ lưỡi trai</h1>
                            </AnimatedSection>
                            <AnimatedSection animation="slideUp" delay={0.7}>
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
                            </AnimatedSection>
                            <AnimatedSection animation="slideUp" delay={0.8}>
                                <div className="product-details-price">220,000 đ</div>
                            </AnimatedSection>
                            <AnimatedSection animation="slideUp" delay={0.9}>
                                <div className="product-details-viewers">
                                    <img src={eyeIcon} alt="viewers" />
                                    <span>24 người đã xem qua sản phẩm</span>
                                </div>
                            </AnimatedSection>           
                            <AnimatedSection animation="slideUp" delay={1.0}>
                                <div className="product-details-size-section">
                                    <div className="product-details-size-title">
                                        Size: <span className="product-details-size-value">{selectedSize}</span>
                                    </div>
                                    <div className="product-details-size-options">
                                        {sizeOptions.map((size, index) => (
                                            <AnimatedSection 
                                                key={size}
                                                animation="zoomIn" 
                                                delay={1.1 + index * 0.1}
                                                hoverEffect="zoom"
                                            >
                                                <div 
                                                    className={`product-details-size-option ${selectedSize === size ? 'active' : ''}`}
                                                    onClick={() => handleSizeSelect(size)}
                                                >
                                                    {size}
                                                </div>
                                            </AnimatedSection>
                                        ))}
                                    </div>
                                </div>
                            </AnimatedSection>     
                            <AnimatedSection animation="slideUp" delay={1.2}>
                                <div className="product-details-color-section">
                                    <div className="product-details-color-title">
                                        Color: <span className="product-details-size-value">{selectedColor}</span>
                                    </div>
                                    <div className="product-details-color-options">
                                        {colorOptions.map((color, index) => (
                                            <AnimatedSection 
                                                key={color.name}
                                                animation="zoomIn" 
                                                delay={1.3 + index * 0.1}
                                                hoverEffect="zoom"
                                            >
                                                <div 
                                                    className={`product-details-color-option ${color.class} ${selectedColor === color.name ? 'active' : ''}`}
                                                    onClick={() => handleColorSelect(color.name)}
                                                ></div>
                                            </AnimatedSection>
                                        ))}
                                    </div>
                                </div>
                            </AnimatedSection>          
                            <AnimatedSection animation="slideUp" delay={1.4}>
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
                            </AnimatedSection>      
                            <AnimatedSection animation="slideUp" delay={1.5}>
                                <div className="product-details-actions">
                                    <AnimatedSection animation="zoomIn" delay={1.6} hoverEffect="zoom">
                                        <button className="product-details-add-to-cart-btn" onClick={handleAddToCart}>
                                            <img src={cartIcon} alt="cart" style={{ width: '20px', marginRight: '10px', filter: 'brightness(0) saturate(100%) invert(22%) sepia(27%) saturate(606%) hue-rotate(111deg) brightness(93%) contrast(87%)' }} />
                                            Thêm vào giỏ hàng
                                        </button>
                                    </AnimatedSection>
                                    <AnimatedSection animation="zoomIn" delay={1.7} hoverEffect="zoom">
                                        <button className="product-details-buy-btn" onClick={handleBuyNow}>
                                            Mua hàng
                                        </button>
                                    </AnimatedSection>
                                    <AnimatedSection animation="zoomIn" delay={1.8} hoverEffect="zoom">
                                        <button className="product-details-share-btn">
                                            <img src={shareIcon} alt="share" style={{ width: '20px' }} />
                                        </button>
                                    </AnimatedSection>
                                </div>
                            </AnimatedSection>
                        </AnimatedSection>
                    </div>
                </AnimatedSection>
                <AnimatedSection animation="slideUp" delay={0.3}>
                    <div className="product-details-description-container">
                        <div className="product-details-description-row">
                            <AnimatedSection animation="slideRight" delay={0.5}>
                                <div className="product-details-description-cell">
                                    <h3 className="product-details-description-title">Mô tả sản phẩm</h3>
                                </div>
                            </AnimatedSection>
                            <AnimatedSection animation="slideLeft" delay={0.7}>
                                <div className="product-details-description-cell">
                                    <p className="product-details-description-content">
                                        GreenWeave được thành lập với sứ mệnh thay đổi ngành 
                                        công nghiệp thời trang thông qua các sản phẩm thân thiện với 
                                        môi trường. Chúng tôi sử dụng vải nhựa tái chế và các vật liệu 
                                        bền vững để tạo ra những sản phẩm thời trang chất lượng cao 
                                        mà không gây hại cho hành tinh.
                                    </p>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
            <AnimatedSection animation="fadeIn" delay={0.2}>
                <section className="product-recommendations">
                    <div className="product-recommendations-container">
                        <AnimatedSection animation="slideUp" delay={0.4}>
                            <h2 className="product-recommendations-title">Đề xuất</h2>
                        </AnimatedSection>
                        <div className="product-recommendations-grid">
                            {recommendedProducts.map((product, index) => (
                                <AnimatedSection 
                                    key={product.id}
                                    animation="slideUp" 
                                    delay={0.6 + index * 0.2}
                                    hoverEffect="zoom"
                                >
                                    <Link to={`/products/${product.id}`} className="recommendation-card">
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
                                </AnimatedSection>
                            ))}
                        </div>
                        <AnimatedSection animation="fadeIn" delay={1.2}>
                            <div className="recommendation-dots">
                                {[0, 1, 2, 3].map((index) => (
                                    <AnimatedSection 
                                        key={index}
                                        animation="zoomIn" 
                                        delay={1.3 + index * 0.1}
                                        hoverEffect="zoom"
                                    >
                                        <button 
                                            className={`recommendation-dot ${activeRecommendationDot === index ? 'active' : ''}`}
                                            onClick={() => handleDotClick(index)}
                                            aria-label={`Recommendation page ${index + 1}`}
                                        />
                                    </AnimatedSection>
                                ))}
                            </div>
                        </AnimatedSection>
                    </div>
                </section>
            </AnimatedSection>
            <Footer />
        </>
    );
};
export default ProductDetails;
