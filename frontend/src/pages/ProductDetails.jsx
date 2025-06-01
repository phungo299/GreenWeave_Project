import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import ProductReview from '../components/layout/productreview/ProductReview';
import { useCart } from '../context/CartContext';
import AnimatedSection from '../components/common/AnimatedSection';
import productService from '../services/productService';
import '../assets/css/ProductDetails.css';

import starIcon from '../assets/icons/star.png';
import eyeIcon from '../assets/icons/visible-opened-eye-interface-option.png';
import cartIcon from '../assets/icons/cart.png';
import shareIcon from '../assets/icons/share.png';

const ProductDetails = () => {
    const { id } = useParams(); // Get product id from URL
    const navigate = useNavigate();
    const { addToCart } = useCart();    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeRecommendationDot, setActiveRecommendationDot] = useState(0);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    // Size options
    const sizeOptions = useMemo(() => ['S', 'M', 'L', 'XL', 'XXL'], []);
  
    // Color options (Mặc định)
    const defaultColorOptions = useMemo(() => [
        { name: 'Gray', class: 'product-details-color-gray', hexCode: '#E5E7EB' },
        { name: 'Yellow', class: 'product-details-color-yellow', hexCode: '#FDE68A' },
        { name: 'Mint', class: 'product-details-color-mint', hexCode: '#A7F3D0' },
        { name: 'Light Blue', class: 'product-details-color-lightblue', hexCode: '#93C5FD' },
        { name: 'Red', class: 'product-details-color-red', hexCode: '#FCA5A5' }
    ], []);

    // Fetch recommended products (products in the same category) and product details when component mounts or id changes
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;          
            try {
                setLoading(true);
                const response = await productService.getById(id);
                console.log('Product details response:', response);              
                if (response && response.data) {
                    const productData = response.data;
                    // Set product data
                    setProduct({
                        id: productData._id,
                        name: productData.name || productData.title,
                        description: productData.description || 'Sản phẩm bền vững',
                        price: productData.price?.toLocaleString() || 0,
                        stock: productData.stock,
                        quantity: productData.quantity || 0,
                        category: productData.categoryId?.name || productData.category || 'Chưa phân loại',
                        image: (productData.images && productData.images.length > 0) 
                            ? productData.images[0] 
                            : productData.imageUrl,
                        selectedColor: productData.selectedColor,
                        selectedSize: productData.selectedSize,
                        rating: productData.rating || 5,
                        reviewCount: productData.reviewCount || 0
                    });  
                    // Set initial selected values if available
                    if (productData.selectedSize) {
                        setSelectedSize(productData.selectedSize);
                    }
                    if (productData.selectedColor) {
                        setSelectedColor(productData.selectedColor);
                    } else {
                        setSelectedColor(defaultColorOptions[0].name);
                    }                                     
                    // Fetch recommended products directly here
                    const categoryId = productData.categoryId?._id;                   
                    if (categoryId) {
                        try {
                            const recResponse = await productService.getByCategory(categoryId);
                            console.log('Products by category response:', recResponse);                            
                            if (recResponse && recResponse.success && recResponse.products) {
                                // Filter out current product and take up to 3 products
                                const filteredProducts = recResponse.products
                                    .filter(item => item._id !== id)
                                    .slice(0, 3);                                  
                                const formattedProducts = filteredProducts.map(item => ({
                                    id: item._id,
                                    name: item.name || item.title,
                                    description: item.description || 'Sản phẩm bền vững',
                                    price: `${item.price?.toLocaleString() || 0} đ`,
                                    image: (item.images && item.images.length > 0) 
                                        ? item.images[0] 
                                        : item.imageUrl
                                }));            
                                setRecommendedProducts(formattedProducts);
                            }
                        } catch (err) {
                            console.error('Error fetching products by category:', err);
                            // Fallback to featured products
                            fetchFeaturedProducts();
                        }
                    } else {
                        // If no category, fetch featured products instead
                        fetchFeaturedProducts();
                    }
                } else {
                    setError('Không thể tải thông tin sản phẩm');
                }
            } catch (err) {
                console.error('Error fetching product details:', err);
                setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
    
        const fetchFeaturedProducts = async () => {
            try {
                const response = await productService.getFeatured();
                if (response && response.success && response.data) {
                    const formattedProducts = response.data.map(item => ({
                        id: item._id,
                        name: item.name || item.title,
                        description: item.description || 'Sản phẩm bền vững',
                        price: `${item.price?.toLocaleString() || 0} đ`,
                        image: (item.images && item.images.length > 0) 
                            ? item.images[0] 
                            : item.imageUrl
                    }));
                    setRecommendedProducts(formattedProducts.slice(0, 3));
                }
            } catch (err) {
                console.error('Error fetching featured products:', err);
            }
        };              
        fetchData();
    }, [id, defaultColorOptions]);

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
            // Check if current quantity has reached stock limit
            if (product.quantity && quantity < product.quantity) {
                setQuantity(quantity + 1);
            } else {
                // Notify user that limit has been reached
                alert(`Số lượng tối đa có thể đặt là ${product.quantity}`);
            }
        } else if (action === 'decrement' && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
  
    // Handler for adding to cart
    const handleAddToCart = () => {
        if (!product) return;      
        if (quantity > 0) {
            const productToAdd = {
                id: product.id,
                name: product.name,
                title: product.title || '',
                color: selectedColor,
                size: selectedSize,
                price: parseInt(product.price.replace(/\D/g, '')),
                quantity: quantity,
                image: product.image
            };          
            // Call addToCart function from context - updated to call API if logged in
            addToCart(productToAdd);            
            // Show a confirmation message
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

    // Scroll to top when component mounts or id changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="product-details-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin sản phẩm...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Header />
                <div className="product-details-error">
                    <h2>Không tìm thấy sản phẩm</h2>
                    <p>{error || 'Sản phẩm không tồn tại hoặc đã bị xóa'}</p>
                    <button onClick={() => navigate('/products')}>Quay lại danh sách sản phẩm</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="product-details-container">
                <AnimatedSection animation="fadeIn" duration={0.8}>
                    <div className="product-details-wrapper">
                        <AnimatedSection animation="slideRight" delay={0.2} className="product-details-image">
                            {product.image ? (
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    onError={(e) => {
                                        // Only replace the image once to avoid infinite loop
                                        if (!e.target.src.includes('placeholder-product.png')) {
                                            e.target.onerror = null; // Remove the error handler to avoid infinite loop
                                            e.target.src = '/assets/images/placeholder-product.png'; // Use static path
                                        }
                                    }}
                                />
                            ) : (
                                // Display placeholder immediately if no image
                                <div className="product-details-image-placeholder">
                                    <span>Không có hình ảnh</span>
                                </div>
                            )}
                        </AnimatedSection>   
                        <AnimatedSection animation="slideLeft" delay={0.4} className="product-details-info">
                            <AnimatedSection animation="slideUp" delay={0.6}>
                                <h1 className="product-details-title">{product.name}</h1>
                            </AnimatedSection>
                            <AnimatedSection animation="slideUp" delay={0.7}>
                                <div className="product-details-rating">
                                    <div className="product-details-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <img 
                                                key={i} 
                                                src={starIcon} 
                                                alt="star" 
                                                style={{ opacity: i < product.rating ? 1 : 0.3 }}
                                            />
                                        ))}
                                    </div>
                                    <span className="product-details-reviews">({product.reviewCount})</span>
                                </div>
                            </AnimatedSection>
                            <AnimatedSection animation="slideUp" delay={0.8}>
                                <div className="product-details-price">{product.price} đ</div>
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
                                        {defaultColorOptions.map((color, index) => {
                                            // Check if the product color matches the color in the list
                                            const isActive = selectedColor === color.name || 
                                                (product.selectedColor && product.selectedColor === color.hexCode);                                 
                                            return (
                                                <AnimatedSection 
                                                    key={color.name}
                                                    animation="zoomIn" 
                                                    delay={1.3 + index * 0.1}
                                                    hoverEffect="zoom"
                                                >
                                                    <div 
                                                        className={`product-details-color-option ${color.class} ${isActive ? 'active' : ''}`}
                                                        onClick={() => handleColorSelect(color.name)}
                                                        style={{ backgroundColor: color.hexCode }}
                                                    ></div>
                                                </AnimatedSection>
                                            );
                                        })}
                                    </div>
                                </div>
                            </AnimatedSection>          
                            <AnimatedSection animation="slideUp" delay={1.4}>
                                <div className="product-details-quantity">
                                    <div className="product-details-quantity-title">
                                        Số lượng: <span className="product-details-quantity-available">
                                            {product.quantity ? `(Còn ${product.quantity} sản phẩm)` : ''}
                                        </span>
                                    </div>
                                    <div className="product-details-quantity-control">
                                        <button 
                                            className="product-details-quantity-btn" 
                                            onClick={() => handleQuantityChange('decrement')}
                                            disabled={quantity <= 1}
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
                                            disabled={product.quantity && quantity >= product.quantity}
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
                {/* Product description section */}
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
                                        {product.description || 'Không có mô tả cho sản phẩm này.'}
                                    </p>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </AnimatedSection>
                {/*Product Review component*/}
                <AnimatedSection animation="fadeIn" delay={0.4}>
                    {product && <ProductReview productId={product.id} />}
                </AnimatedSection>
            </div>
            {/* Recommendations section */}         
            {recommendedProducts.length > 0 && (
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
                                                {product.image ? (
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name} 
                                                        className="recommendation-image"
                                                        onError={(e) => {
                                                            // Only replace the image once to avoid infinite loop
                                                            if (!e.target.src.includes('placeholder-product.png')) {
                                                                e.target.onerror = null;
                                                                e.target.src = '/assets/images/placeholder-product.png';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="recommendation-image-placeholder">
                                                        <span>Không có hình ảnh</span>
                                                    </div>
                                                )}
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
                            {recommendedProducts.length > 3 && (
                                <AnimatedSection animation="fadeIn" delay={1.2}>
                                    <div className="recommendation-dots">
                                        {[...Array(Math.ceil(recommendedProducts.length / 3))].map((_, index) => (
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
                            )}
                        </div>
                    </section>
                </AnimatedSection>
            )}
            <Footer />
        </>
    );
};
export default ProductDetails;