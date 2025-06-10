import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import ProductCard from '../components/ui/productcard/ProductCard';
import HeroImage from '../components/ui/HeroImage';
import AnimatedSection from '../components/common/AnimatedSection';

import productService from '../services/productService';
import '../assets/css/LandingPageV2.css';

// Preset animation variants
const smoothZoomIn = {
    hidden: { opacity: 0, scale: 0.92, filter: "blur(2px)" },
    visible: {
        opacity: 1, scale: 1, filter: "blur(0px)",
        transition: { type: "spring", stiffness: 66, damping: 20, mass: 0.9, duration: 1.05 }
    }
};
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
};
const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 18, duration: 0.9 } }
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFeature, setActiveFeature] = useState(0);
    const [heroVisible, setHeroVisible] = useState(false);

    // Fetch featured products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getFeatured();
                if (response?.success && response?.data) {
                    const formatted = response.data.slice(0, 6).map(product => ({
                        id: product._id,
                        name: product.name || product.title,
                        description: product.description || 'Sản phẩm bền vững',
                        price: `${product.price?.toLocaleString() || 0} đ`,
                        image: product.images?.[0] || product.imageUrl,
                        originalPrice: product.price ? `${(product.price * 1.2).toLocaleString()} đ` : null
                    }));
                    setFeaturedProducts(formatted);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Hero animation trigger
    useEffect(() => {
        const timer = setTimeout(() => setHeroVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        {
            icon: "🌱",
            title: "100% Bền Vững",
            description: "Sản phẩm từ vật liệu tái chế và thân thiện môi trường"
        },
        {
            icon: "🎨",
            title: "Thiết Kế Độc Đáo",
            description: "Phong cách hiện đại, trendy phù hợp mọi lứa tuổi"
        },
        {
            icon: "✨",
            title: "Chất Lượng Cao",
            description: "Kiểm định nghiêm ngặt, bảo hành chính hãng"
        }
    ];

    return (
        <div className="landing-v2">
            <Header />
            
            {/* ULTRA MINIMALIST Hero Section - 2024 Trend */}
            <section className="minimalist-hero" id="home">
                <div className="container">
                    <AnimatedSection variants={fadeIn}>
                    <div className="minimalist-hero__content">
                        <AnimatedSection variants={slideUp}>
                        <h1 className={`minimalist-hero__title ${heroVisible ? 'minimalist-hero__title--visible' : ''}`}>
                            Phong cách.<br />
                            <span className="minimalist-hero__accent">Bền vững.</span><br />
                            Tương lai.
                        </h1>
                        </AnimatedSection>
                        <AnimatedSection variants={fadeIn} delay={0.1}>
                        <p className={`minimalist-hero__description ${heroVisible ? 'minimalist-hero__description--visible' : ''}`}>
                            Thời trang có ý thức sinh thái<br />cho thế hệ tương lai
                        </p>
                        </AnimatedSection>
                        <AnimatedSection variants={smoothZoomIn} delay={0.2}>
                        <div className={`minimalist-hero__actions ${heroVisible ? 'minimalist-hero__actions--visible' : ''}`}>
                            <button 
                                className="minimalist-hero__cta"
                                onClick={() => navigate('/products')}
                            >
                                Khám phá ngay
                            </button>
                        </div>
                        </AnimatedSection>
                        <AnimatedSection variants={slideUp} delay={0.3}>
                        <div className={`minimalist-hero__stats ${heroVisible ? 'minimalist-hero__stats--visible' : ''}`}>
                            <div className="stat-simple">
                                <span className="stat-number">5K+</span>
                                <span className="stat-label">Khách hàng</span>
                            </div>
                            <div className="stat-simple">
                                <span className="stat-number">98%</span>
                                <span className="stat-label">Hài lòng</span>
                            </div>
                            <div className="stat-simple">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Bền vững</span>
                            </div>
                        </div>
                        </AnimatedSection>
                    </div>
                    </AnimatedSection>
                    <AnimatedSection variants={smoothZoomIn} delay={0.2}>
                    <div className={`minimalist-hero__image-section ${heroVisible ? 'minimalist-hero__image-section--visible' : ''}`}>
                        <div className="minimalist-hero__image-wrapper">
                            <HeroImage
                                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Bộ sưu tập thời trang sinh thái"
                                className="minimalist-hero__image"
                                fallbackSrc="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            />
                        </div>
                    </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="container">
                    <AnimatedSection variants={fadeIn}>
                    <div className="section-header">
                        <h2 className="section-title">Tại Sao Chọn GreenWeave?</h2>
                        <p className="section-subtitle">
                            Chúng tôi cam kết mang đến những sản phẩm tốt nhất cho bạn và hành tinh
                        </p>
                    </div>
                    </AnimatedSection>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <AnimatedSection key={index} variants={slideUp} delay={0.1 * index}>
                            <div 
                                className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                                onMouseEnter={() => setActiveFeature(index)}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            

            {/* Products Section */}
            <section className="products-section" id="products">
                <div className="container">
                    <AnimatedSection variants={fadeIn}>
                    <div className="section-header">
                        <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
                        <p className="section-subtitle">
                            Khám phá những món đồ thời trang được yêu thích nhất
                        </p>
                    </div>
                    </AnimatedSection>
                    
                    {loading ? (
                        <div className="products-loading">
                            <div className="loading-spinner-v2"></div>
                            <p>Đang tải sản phẩm...</p>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {featuredProducts.map((product, index) => (
                                    <AnimatedSection key={product.id} variants={smoothZoomIn} delay={0.1 * index}>
                                    <div 
                                        className="product-item"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <ProductCard
                                            id={product.id}
                                            name={product.name}
                                            description={product.description}
                                            price={product.price}
                                            image={product.image}
                                            onClick={(id) => navigate(`/products/${id}`)}
                                        />
                                        {product.originalPrice && (
                                            <div className="product-badge">-20%</div>
                                        )}
                                    </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                            <div className="products-actions">
                                <button 
                                    className="btn-outline"
                                    onClick={() => navigate('/products')}
                                >
                                    Xem Tất Cả Sản Phẩm
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* About Brief Section */}
            <section className="about-brief-section" id="about">
                <div className="container">
                    <div className="about-content">
                        <AnimatedSection variants={slideUp}>
                        <div className="about-text-content">
                            <h2 className="about-title">Câu Chuyện GreenWeave</h2>
                            <p className="about-description">
                                Chúng tôi tin rằng thời trang không chỉ là việc trông đẹp, mà còn là việc 
                                cảm thấy tốt về những gì bạn mặc. Mỗi sản phẩm của GreenWeave được tạo ra 
                                với sứ mệnh bảo vệ hành tinh và mang lại giá trị bền vững.
                            </p>
                            <div className="about-highlights">
                                <div className="highlight">
                                    <span className="highlight-icon">♻️</span>
                                    <span>Vật liệu tái chế 100%</span>
                                </div>
                                <div className="highlight">
                                    <span className="highlight-icon">🌿</span>
                                    <span>Quy trình sản xuất xanh</span>
                                </div>
                                <div className="highlight">
                                    <span className="highlight-icon">💚</span>
                                    <span>Thương hiệu vì môi trường</span>
                                </div>
                            </div>
                            <button 
                                className="btn-primary"
                                onClick={() => navigate('/about-us')}
                            >
                                Tìm Hiểu Thêm
                            </button>
                        </div>
                        </AnimatedSection>
                        <AnimatedSection variants={smoothZoomIn} delay={0.2}>
                        <div className="about-image">
                            <HeroImage
                                src="https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="About GreenWeave"
                                className="about-img"
                                fallbackSrc="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            />
                        </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section" id="contact">
                <div className="container">
                    <AnimatedSection variants={fadeIn}>
                    <div className="cta-content">
                        <h2 className="cta-title">Sẵn Sàng Cho Phong Cách Xanh?</h2>
                        <p className="cta-description">
                            Tham gia cộng đồng thời trang bền vững và nhận ưu đãi đặc biệt
                        </p>
                        <div className="cta-actions">
                            <button 
                                className="btn-primary btn-large"
                                onClick={() => navigate('/products')}
                            >
                                Mua Sắm Ngay
                            </button>
                            <div className="cta-features">
                                <span>🚚 Miễn phí vận chuyển</span>
                                <span>🔄 Đổi trả 30 ngày</span>
                                <span>⭐ Bảo hành chính hãng</span>
                            </div>
                        </div>
                    </div>
                    </AnimatedSection>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;