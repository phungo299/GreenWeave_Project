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
    const [dataLoaded, setDataLoaded] = useState(false);
    const navigate = useNavigate();
  
    // Fetch featured products when component mounts
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                setDataLoaded(false);
                const response = await productService.getFeatured();
                
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
                // Set empty products array on error
                setProducts([]);
            } finally {
                setLoading(false);
                // Add delay to ensure smooth animation after data is ready
                setTimeout(() => {
                    setDataLoaded(true);
                }, 100);
            }
        };
        
        fetchFeaturedProducts();
    }, []);

    const goToSlide = (index) => {
        setActiveSlide(index);
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleViewAllClick = () => {
        navigate('/products');
    };

    return (
        <section id="products" className="featured-product-section">
            <div className="featured-product-container">
                {/* Header Animation - Always show */}
                <AnimatedSection animation="fadeIn" delay={0.1} duration={0.6}>
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
                </AnimatedSection>

                {/* Content Animation - Only after data loaded */}
                <AnimatedSection 
                    animation="slideUp" 
                    delay={dataLoaded ? 0.3 : 0} 
                    duration={0.6}
                    key={dataLoaded ? 'loaded' : 'loading'} // Force re-render when data loads
                >
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
                                    <AnimatedSection
                                        key={product.id} 
                                        animation="slideUp"
                                        delay={0.1 + index * 0.1}
                                        duration={0.5}
                                        className="product-card-wrapper"
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
                                    </AnimatedSection>
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
                </AnimatedSection>

                {/* View All Button Animation */}
                <AnimatedSection animation="fadeIn" delay={dataLoaded ? 0.5 : 0}>
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