import React, { useState } from 'react';
import './Product.css';
import ProductCard from '../../components/ui/productcard/ProductCard';

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
            imageClass: ''
        },
        {
            id: 2,
            name: 'Mũ lưỡi trai',
            description: 'Moist but well-drained',
            price: '220.000 đ',
            image: hat,
            imageClass: 'hat-image'
        },
        {
            id: 3,
            name: 'Áo phông',
            description: 'Moist but well-drained',
            price: '300.000 đ',
            image: tshirt,
            imageClass: ''
        }
    ];

    const goToSlide = (index) => {
        setActiveSlide(index);
    };

    const handleProductClick = (productId) => {
        // Handle product detail navigation
        console.log('Navigate to product detail page for ID:', productId);
        // You can implement navigation here, for example:
        // navigate(`/products/${productId}`);
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
                        {products.map((product) => (
                            <ProductCard 
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                description={product.description}
                                price={product.price}
                                image={product.image}
                                imageClass={product.imageClass}
                                onClick={handleProductClick}
                            />
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
