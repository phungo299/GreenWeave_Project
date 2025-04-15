import React, { useState } from 'react';
import './Product.css';

import toteBag from '../../assets/images/footer-background.jpg';
import hat from '../../assets/images/baseball-cap-products.jpg';
import tshirt from '../../assets/images/T-shirt products.jpg';

const Product = () => {
    const [activeSlide, setActiveSlide] = useState(0);
  
    const products = [
        {
            id: 1,
            name: 'Túi tote tái chế',
            description: 'Moist but well-drained',
            price: '280.000 đ',
            image: toteBag,
            imageClass: 'featured-product-image'
        },
        {
            id: 2,
            name: 'Mũ lưỡi trai',
            description: 'Moist but well-drained',
            price: '220.000 đ',
            image: hat,
            imageClass: 'featured-product-image featured-hat-image'
        },
        {
            id: 3,
            name: 'Áo phông',
            description: 'Moist but well-drained',
            price: '300.000 đ',
            image: tshirt,
            imageClass: 'featured-product-image'
        }
    ];

    const goToSlide = (index) => {
        setActiveSlide(index);
    };

    return (
        <section id="products" className="featured-product-section">
            <div className="featured-product-container">
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
                <div className="featured-product-slider">
                    <div className="featured-product-cards">
                        {products.map((product, index) => (
                            <div key={product.id} className="featured-product-card">
                                <div className="featured-product-image-container">
                                    <img src={product.image} alt={product.name} className={product.imageClass} />
                                </div>
                                <div className="featured-product-info">
                                    <h3 className="featured-product-name">{product.name}</h3>
                                    <p className="featured-product-description">{product.description}</p>
                                    <p className="featured-product-price">{product.price}</p>
                                </div>
                                <button className="featured-product-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
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
                <div className="featured-product-view-all-container">
                    <button className="featured-product-view-all-button">Xem tất cả</button>
                </div>
            </div>
        </section>
    );
};
export default Product;
