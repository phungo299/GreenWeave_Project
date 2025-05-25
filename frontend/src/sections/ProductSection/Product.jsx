import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Product.css';
import ProductCard from '../../components/ui/productcard/ProductCard';
import AnimatedSection from '../../components/common/AnimatedSection';

import toteBag from '../../assets/images/footer-background.jpg';
import hat from '../../assets/images/baseball-cap-products.jpg';
import tshirt from '../../assets/images/T-shirt products.jpg';

const Product = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const navigate = useNavigate();
  
    const products = [
        {
            id: 1,
            name: 'Túi tote tái chế',
            description: 'Thân thiện với môi trường',
            price: '280.000 đ',
            image: toteBag,
            imageClass: ''
        },
        {
            id: 2,
            name: 'Mũ lưỡi trai',
            description: 'Phong cách trẻ trung',
            price: '220.000 đ',
            image: hat,
            imageClass: 'hat-image'
        },
        {
            id: 3,
            name: 'Áo phông',
            description: 'Thoải mái mọi hoạt động',
            price: '300.000 đ',
            image: tshirt,
            imageClass: ''
        }
    ];

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
                {/* Header with Animation */}
                <AnimatedSection animation="slideUp" delay={0.1}>
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

                {/* Product Cards with Staggered Animation */}
                <AnimatedSection animation="slideUp" delay={0.3}>
                    <div className="featured-product-slider">
                        <div className="featured-product-cards">
                            {products.map((product, index) => (
                                <div key={product.id} className="product-card-wrapper">
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
                    </div>
                </AnimatedSection>

                {/* Dots with Animation */}
                <AnimatedSection animation="fadeIn" delay={0.5}>
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
                </AnimatedSection>

                {/* View All Button with Animation */}
                <AnimatedSection animation="slideUp" delay={0.6}>
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
