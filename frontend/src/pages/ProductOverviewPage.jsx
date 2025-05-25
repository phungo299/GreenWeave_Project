import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import ProductCard from '../components/ui/productcard/ProductCard';
import ProductSection from '../sections/ProductSection/Product';
import AnimatedSection from '../components/common/AnimatedSection';
import '../assets/css/ProductOverviewPage.css';
import '../assets/css/scroll-fix.css';

import toteBag1 from '../assets/images/recycled-tote-bag-1.jpg';
import toteBag2 from '../assets/images/recycled-tote-bag-2.jpg';
import toteBag3 from '../assets/images/recycled-tote-bag-3.jpg';
import cap1 from '../assets/images/cap-1.JPG';
import cap2 from '../assets/images/cap-2.JPG';
import cap3 from '../assets/images/cap-3.jpg';
import tshirt from '../assets/images/T-shirt products.jpg';
import tshirt2 from '../assets/images/IMG_8402.JPG';
import tshirt3 from '../assets/images/IMG_8418.JPG';
import backpack from '../assets/images/IMG_8425.JPG';
import bucketHat from '../assets/images/IMG_8379.JPG';
import tShirtNew from '../assets/images/IMG_8391.JPG';
import Logo from '../assets/images/logo-no-background.png';

const PRODUCTS_PER_PAGE = 6;

const ProductOverviewPage = () => {
    const navigate = useNavigate();
    // State to keep track of the currently selected category
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // State to track active slide for upcoming product
    const [activeComingSlide, setActiveComingSlide] = useState(0);

    const allProducts = useMemo(() => [
        {
            id: 1,
            name: 'Túi tote tái chế',
            description: 'Thân thiện với môi trường',
            price: '280.000 đ',
            image: toteBag1,
            category: 'tote'
        },
        {
            id: 2,
            name: 'Túi tote tái chế',
            description: 'Chất liệu bền vững',
            price: '280.000 đ',
            image: toteBag2,
            category: 'tote'
        },
        {
            id: 3,
            name: 'Túi tote tái chế',
            description: 'Thiết kế hiện đại',
            price: '280.000 đ',
            image: toteBag3,
            category: 'tote'
        },
        {
            id: 4,
            name: 'Mũ lưỡi trai',
            description: 'Phong cách trẻ trung',
            price: '280.000 đ',
            image: cap1,
            category: 'cap',
            imageClass: 'hat-image'
        },
        {
            id: 5,
            name: 'Mũ Bucket',
            description: 'Xu hướng thời trang',
            price: '280.000 đ',
            image: cap2,
            category: 'cap',
            imageClass: 'hat-image'
        },
        {
            id: 6,
            name: 'Mũ lưỡi trai',
            description: 'Chất lượng cao cấp',
            price: '280.000 đ',
            image: cap3,
            category: 'cap',
            imageClass: 'hat-image'
        },
        {
            id: 7,
            name: 'Áo phông',
            description: 'Thoải mái mọi hoạt động',
            price: '280.000 đ',
            image: tshirt,
            category: 'tshirt'
        },
        {
            id: 8,
            name: 'Áo phông họa tiết',
            description: 'Độc đáo và sáng tạo',
            price: '300.000 đ',
            image: tshirt2,
            category: 'tshirt'
        },
        {
            id: 9,
            name: 'Áo phông trơn',
            description: 'Đơn giản nhưng tinh tế',
            price: '280.000 đ',
            image: tshirt3,
            category: 'tshirt'
        }
    ], []);
    
    // Upcoming products
    const comingSoonProducts = useMemo(() => [
        {
            id: 'coming1',
            name: 'Balo',
            description: 'Tiện dụng cho mọi chuyến đi',
            price: '280.000 đ',
            image: backpack
        },
        {
            id: 'coming2',
            name: 'Mũ bucket',
            description: 'Phong cách năng động',
            price: '220.000 đ',
            image: bucketHat,
            imageClass: 'hat-image'
        },
        {
            id: 'coming3',
            name: 'Áo phông',
            description: 'Thiết kế mới nhất',
            price: '300.000 đ',
            image: tShirtNew
        }
    ], []);

    // List of categories
    const categories = useMemo(() => [
        { id: 'all', name: 'Tất cả' },
        { id: 'tshirt', name: 'Áo phông' },
        { id: 'tote', name: 'Túi tote' },
        { id: 'cap', name: 'Mũ nón' },
        { id: 'balo', name: 'Balo' }
    ], []);

    // Filter products by category
    const filteredProducts = useMemo(() => {
        return activeCategory === 'all' 
            ? allProducts 
            : allProducts.filter(product => product.category === activeCategory);
    }, [activeCategory, allProducts]);

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
                                    <span className="stat-number">50+</span>
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
                        <div className="product-grid">
                            {visibleProducts.map((product, index) => (
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
                            ))}
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
                    </div>
                </AnimatedSection>
                
                {/* Coming Soon Section with Enhanced Animation */}
                <AnimatedSection animation="fadeIn" delay={0.5}>
                    <div className="coming-soon-section">
                        <AnimatedSection animation="slideUp" delay={0.2}>
                            <div className="coming-soon-header">
                                <div className="coming-soon-title-container">
                                    <h2 className="coming-soon-title-main">Sản phẩm</h2>
                                    <h2 className="coming-soon-title-sub">sắp ra mắt</h2>
                                </div>
                                <p className="coming-soon-description">
                                    Những sản phẩm mới nhất sẽ sớm có mặt trong bộ sưu tập của chúng tôi
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
                                        <button className="coming-soon-button">
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
            </main>            
            <Footer />
        </div>
    );
};
export default ProductOverviewPage;