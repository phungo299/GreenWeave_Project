import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Product.css';
import ProductCard from '../../components/ui/productcard/ProductCard';
import AnimatedSection from '../../components/common/AnimatedSection';
import productService from '../../services/productService';

const Product = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  
    // Fetch featured products when component mounts
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getFeatured();
                console.log('Featured products response:', response);              
                if (response && response.success && response.data && response.data.length > 0) {
                    // Format featured products
                    const formattedProducts = response.data.map(product => ({
                        id: product._id,
                        name: product.name || product.title,
                        description: product.description || 'Sản phẩm bền vững',
                        price: `${product.price?.toLocaleString() || 0} đ`,
                        image: (product.images && product.images.length > 0) 
                            ? product.images[0] 
                            : product.imageUrl,
                        imageClass: product.categoryId?.name?.toLowerCase().includes('mũ') ? 'hat-image' : ''
                    }));                  
                    // Use up to 3 featured products
                    setProducts(formattedProducts.slice(0, 3));
                } else {
                    // If no featured products found, throw error to use fallback
                    throw new Error('No featured products found');
                }
            } catch (err) {
                console.error('Error fetching featured products:', err);
                setError(err.message);
                // Use fallback to default products (keep the existing ones)
                // We're not setting any fallback products here as we'll show an error message
            } finally {
                setLoading(false);
            }
        };
        
        fetchFeaturedProducts();
    }, []);

    const goToSlide = (index) => {
        setActiveSlide(index);
    };

    const handleProductClick = (productId) => {
        console.log('Navigate to product detail page for ID:', productId);
        navigate(`/products/${productId}`);
    };

    const handleViewAllClick = () => {
        navigate('/products');
    };

    return (
        <section id="products" className="featured-product-section">
            <div className="featured-product-container">
                {/* Single AnimatedSection wrapper for entire content */}
                <AnimatedSection animation="fadeIn" delay={0.1} duration={0.6}>
                    {/* Header */}
                    <div className="featured-product-header">
                        <div className="featured-product-title-wrapper">
                            <div className="featured-product-title-container">
                                <h2 className="featured-product-title-main">Sản phẩm</h2>
                                <h2 className="featured-product-title-sub">nổi bật</h2>
                            </div>
                            <div className="featured-product-subtitle">
                                Khám phá các sản phẩm thời trang bền vững được làm<br />
                                từ vật liệu tái chế và thân thiện với môi trường
                            </div>
                        </div>
                    </div>
                    {/* Product Cards with CSS-based staggered animation */}
                    <div className="featured-product-slider">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Đang tải sản phẩm nổi bật...</p>
                            </div>
                        ) : error ? (
                            <div className="error-message">
                                <p>Không thể tải sản phẩm nổi bật. Vui lòng thử lại sau.</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="no-products-message">
                                <p>Hiện chưa có sản phẩm nổi bật nào.</p>
                            </div>
                        ) : (
                            <div className="featured-product-cards">
                                {products.map((product, index) => (
                                    <div 
                                        key={product.id} 
                                        className="product-card-wrapper"
                                        style={{ 
                                            animationDelay: `${0.2 + index * 0.1}s`,
                                            opacity: 0,
                                            animation: 'slideUpFade 0.6s ease-out forwards'
                                        }}
                                    >
                                        <ProductCard
                                            id={product.id}
                                            name={product.name}
                                            description={product.description}
                                            price={product.price}
                                            image={product.image}
                                            imageClass={product.imageClass}
                                            onClick={handleProductClick}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Slider Dots - only show if we have products */}
                        {products.length > 0 && (
                            <div className="featured-product-slider-dots">
                                {products.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`featured-product-slider-dot ${activeSlide === index ? 'active' : ''}`}
                                        onClick={() => goToSlide(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* View All Button */}
                    <div className="featured-product-view-all-container">
                        <button 
                            className="featured-product-view-all-button"
                            onClick={handleViewAllClick}
                        >
                            Xem tất cả
                        </button>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};
export default Product;