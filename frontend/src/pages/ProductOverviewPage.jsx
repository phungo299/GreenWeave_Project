import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import ProductCard from '../components/ui/productcard/ProductCard';
import ProductSection from '../sections/ProductSection/Product';
import AnimatedSection from '../components/common/AnimatedSection';
import '../assets/css/ProductOverviewPage.css';
import '../assets/css/scroll-fix.css';
import productService from '../services/productService';

import Logo from '../assets/images/logo-no-background.png';

const PRODUCTS_PER_PAGE = 6;

const ProductOverviewPage = () => {
    const navigate = useNavigate();
    // State to keep track of the currently selected category
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State to track active slide for upcoming product
    const [activeComingSlide, setActiveComingSlide] = useState(0);
    
    // State for products and categories from API
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [comingSoonProducts, setComingSoonProducts] = useState([]);

    // Fetch categories and products from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);               
                // Fetch categories
                const categoryResponse = await productService.getCategories();
                if (categoryResponse && categoryResponse.categories) {
                    const fetchedCategories = categoryResponse.categories.map(cat => ({
                        id: cat._id,
                        name: cat.name
                    }));                   
                    // Add "All" category at the beginning
                    setCategories([
                        { id: 'all', name: 'Tất cả' },
                        ...fetchedCategories
                    ]);
                }               
                // Fetch all products
                const productResponse = await productService.getAll({ limit: 100 });
                //console.log('Product response: ', productResponse)
                if (productResponse && productResponse.products) {
                    const formattedProducts = productResponse.products.map(product => {
                        // Determine image URL from images array
                        let imageUrl = null;     
                        if (product.images && product.images.length > 0) {
                            // Use blob URL directly from images array
                            imageUrl = product.images[0];
                        } else if (product.imageUrl) {
                            imageUrl = product.imageUrl;
                        }
                        const stockStatus = product.stock === "Hết hàng" || product.quantity <= 0 ? 'Hết hàng' : 'Còn hàng';
                        // Log for debugging
                        console.log('Product image data:', {
                            imageUrl: product.imageUrl,
                            images: product.images
                        });      
                        return {
                            id: product._id,
                            name: product.name || product.title,
                            description: product.description || 'Sản phẩm bền vững',
                            price: `${product.price?.toLocaleString() || 0} đ`,
                            image: imageUrl,
                            category: product.categoryId?._id || 'uncategorized',
                            categoryName: product.categoryId?.name || 'Chưa phân loại',
                            imageClass: product.categoryId?.name?.toLowerCase().includes('mũ') ? 'hat-image' : '',
                            stockStatus: stockStatus,
                        };
                    });
                    setProducts(formattedProducts);   
                    // Get the first 3 products as "coming soon" products (default)
                    // When no out of stock products are found
                    setComingSoonProducts(formattedProducts.slice(0, 3));                  
                    // Find products with "Hết hàng" status to set in Coming Soon slider
                    const outOfStockProducts = formattedProducts.filter(product => 
                        product.stockStatus === 'Hết hàng'
                    ); 
                    //console.log('Out of stock products:', outOfStockProducts);
                    // If there is at least 1 out of stock product, use them for the slider
                    if (outOfStockProducts.length > 0) {
                        if (outOfStockProducts.length >= 3) {
                            // If there are at least 3 out of stock products, use them for the slider
                            setComingSoonProducts(outOfStockProducts.slice(0, 3));
                        } else {
                            // Combine out of stock products with some in stock products to have at least 3
                            const remainingNeeded = 3 - outOfStockProducts.length;
                            const inStockProducts = formattedProducts
                                .filter(product => product.stockStatus === 'Còn hàng')
                                .slice(0, remainingNeeded);
                            setComingSoonProducts([...outOfStockProducts, ...inStockProducts]);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };     
        fetchData();
    }, []);

    // Filter products by category
    const filteredProducts = useMemo(() => {
        return activeCategory === 'all' 
            ? products 
            : products.filter(product => product.category === activeCategory);
    }, [activeCategory, products]);

    // Number of products currently displayed
    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, currentPage * PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // Check if more products can be loaded
    const hasMoreProducts = useMemo(() => {
        return visibleProducts.length < filteredProducts.length;
    }, [visibleProducts, filteredProducts]);

    // Load more products
    const loadMoreProducts = useCallback(() => {
        if (!hasMoreProducts) return;
        
        setIsLoadingMore(true);
        
        setTimeout(() => {
            setCurrentPage(prev => prev + 1);
            setIsLoadingMore(false);
        }, 300);
    }, [hasMoreProducts]);

    // Handle when scrolling down to the bottom of the page
    useEffect(() => {
        const handleScroll = () => {
            if (isLoadingMore || !hasMoreProducts) return;            
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;          
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                loadMoreProducts();
            }
        };       
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, hasMoreProducts, loadMoreProducts]);

    // Reset current page when changing category
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);

    // Process when clicking on product
    const handleProductClick = useCallback((productId) => {
        console.log('Navigating to product detail:', productId);
        navigate(`/products/${productId}`);
    }, [navigate]);
    
    // Handle when switching to upcoming product slide
    const goToComingSoonSlide = useCallback((index) => {
        setActiveComingSlide(index);
    }, []);

    return (
        <div className="product-overview-page">
            <Header />           
            <main className="product-page-content">
                {/* Hero Section with Animation */}
                <AnimatedSection animation="fadeIn" duration={1.0}>
                    <section className="product-hero-section">
                        <div className="product-hero-container">
                            <AnimatedSection animation="slideUp" delay={0.3} className="hero-content">
                                <div className="hero-logo">
                                    <img src={Logo} alt="GreenWeave Logo" className="hero-logo-image" />
                                </div>
                                <h1 className="hero-title">BỘ SƯU TẬP</h1>
                                <h2 className="hero-subtitle">THỜI TRANG BỀN VỮNG</h2>
                                <p className="hero-description">
                                    Khám phá các sản phẩm thời trang được làm từ vật liệu tái chế,
                                    thân thiện với môi trường và phong cách hiện đại
                                </p>
                            </AnimatedSection>                            
                            <AnimatedSection animation="slideLeft" delay={0.5} className="hero-stats">
                                <div className="stat-item">
                                    <span className="stat-number">100%</span>
                                    <span className="stat-label">Vật liệu tái chế</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{products.length}+</span>
                                    <span className="stat-label">Sản phẩm</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">1000+</span>
                                    <span className="stat-label">Khách hàng hài lòng</span>
                                </div>
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>
                {/* Featured Products Section */}
                <AnimatedSection animation="fadeIn" delay={0.2}>
                    <ProductSection />
                </AnimatedSection>               
                {/* Category Filter with Animation */}
                <AnimatedSection animation="slideUp" delay={0.3}>
                    <div className="product-categories">
                        <div className="category-header">
                            <h2 className="category-title">Danh mục sản phẩm</h2>
                            <p className="category-subtitle">Chọn danh mục để xem sản phẩm phù hợp</p>
                        </div>
                        <div className="category-tabs">
                            {categories.map((category, index) => (
                                <AnimatedSection 
                                    key={category.id}
                                    animation="zoomIn" 
                                    delay={0.1 * index}
                                    hoverEffect="zoom"
                                >
                                    <button
                                        className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(category.id)}
                                    >
                                        {category.name}
                                    </button>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>                
                {/* Product Grid with Staggered Animation */}
                <AnimatedSection animation="fadeIn" delay={0.4}>
                    <div className="product-listing">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Đang tải sản phẩm...</p>
                            </div>
                        ) : error ? (
                            <div className="error-container">
                                <p>{error}</p>
                            </div>
                        ) : (
                            <>
                                <div className="product-grid">
                                    {visibleProducts.length === 0 ? (
                                        <div className="no-products-message">
                                            <p>Không có sản phẩm nào trong danh mục này.</p>
                                        </div>
                                    ) : (
                                        visibleProducts.map((product, index) => (
                                            <AnimatedSection 
                                                key={product.id}
                                                animation="slideUp" 
                                                delay={0.1 * (index % 6)}
                                                hoverEffect="zoom"
                                            >
                                                <ProductCard
                                                    id={product.id}
                                                    name={product.name}
                                                    description={product.description}
                                                    price={product.price}
                                                    image={product.image}
                                                    imageClass={product.imageClass || ''}
                                                    onClick={handleProductClick}
                                                />
                                            </AnimatedSection>
                                        ))
                                    )}
                                </div>
                                {hasMoreProducts && (
                                    <AnimatedSection animation="fadeIn" delay={0.2}>
                                        <div className="load-more-container">
                                            <button 
                                                className="load-more-button"
                                                onClick={loadMoreProducts}
                                                disabled={isLoadingMore}
                                            >
                                                {isLoadingMore ? 'Đang tải...' : 'Xem thêm sản phẩm'}
                                            </button>
                                        </div>
                                    </AnimatedSection>
                                )}
                            </>
                        )}
                    </div>
                </AnimatedSection>               
                {/* Coming Soon Section with Enhanced Animation */}
                {comingSoonProducts.length > 0 && (
                    <AnimatedSection animation="fadeIn" delay={0.5}>
                        <div className="coming-soon-section">
                            <AnimatedSection animation="slideUp" delay={0.2}>
                                <div className="coming-soon-header">
                                    <div className="coming-soon-title-container">
                                        <h2 className="coming-soon-title-main">Sản phẩm</h2>
                                        <h2 className="coming-soon-title-sub">sắp ra mắt</h2>
                                    </div>
                                    <p className="coming-soon-description">
                                        Những sản phẩm sắp ra mắt trong bộ sưu tập của chúng tôi
                                    </p>
                                </div>
                            </AnimatedSection>                            
                            <div className="coming-soon-products">
                                {comingSoonProducts.map((product, index) => (
                                    <AnimatedSection 
                                        key={product.id}
                                        animation="slideRight" 
                                        delay={0.2 * index}
                                        hoverEffect="glow"
                                    >
                                        <div 
                                            className={`coming-soon-product ${index === activeComingSlide ? 'active' : ''}`}
                                        >
                                            <div className="coming-soon-image-container">
                                                <div className="product-image-placeholder"></div>
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className={`coming-soon-image ${product.imageClass || ''}`}
                                                    loading="lazy"
                                                    onLoad={(e) => {
                                                        e.target.classList.add('loaded');
                                                        const placeholder = e.target.previousSibling;
                                                        if (placeholder && placeholder.classList.contains('product-image-placeholder')) {
                                                            placeholder.style.display = 'none';
                                                        }
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const placeholder = e.target.previousSibling;
                                                        if (placeholder) {
                                                            placeholder.innerHTML = '<div class="product-image-error">Không thể tải hình ảnh</div>';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="coming-soon-info">
                                                <h3 className="coming-soon-name">{product.name}</h3>
                                                <p className="coming-soon-description">{product.description}</p>
                                                <p className="coming-soon-price">{product.price}</p>
                                            </div>
                                            <button 
                                                className="coming-soon-button"
                                                onClick={() => handleProductClick(product.id)}
                                            >
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
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>                           
                            <AnimatedSection animation="fadeIn" delay={0.8}>
                                <div className="coming-soon-dots">
                                    {comingSoonProducts.map((_, index) => (
                                        <button 
                                            key={index} 
                                            className={`coming-soon-dot ${activeComingSlide === index ? 'active' : ''}`}
                                            onClick={() => goToComingSoonSlide(index)}
                                            aria-label={`Go to coming soon slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </AnimatedSection>
                        </div>
                    </AnimatedSection>
                )}
            </main>            
            <Footer />
        </div>
    );
};
export default ProductOverviewPage;