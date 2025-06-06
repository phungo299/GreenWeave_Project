import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CleanHero.css';

const CleanHero = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="clean-hero">
            {/* Background Effects */}
            <div className="clean-hero__background">
                <div className="clean-hero__gradient-orb clean-hero__gradient-orb--1"></div>
                <div className="clean-hero__gradient-orb clean-hero__gradient-orb--2"></div>
                <div className="clean-hero__gradient-orb clean-hero__gradient-orb--3"></div>
            </div>

            {/* Header Navigation */}
            <header className={`clean-hero__header ${isScrolled ? 'clean-hero__header--scrolled' : ''}`}>
                <div className="clean-hero__nav">
                    <div className="clean-hero__logo">
                        <svg className="clean-hero__logo-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L4 6V12C4 15.31 7.58 20 12 22C16.42 20 20 15.31 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="clean-hero__logo-text">GreenWeave</span>
                    </div>
                    
                    <nav className="clean-hero__menu">
                        <a href="/products" className="clean-hero__menu-link">Sản phẩm</a>
                        <a href="/about" className="clean-hero__menu-link">Về chúng tôi</a>
                        <a href="/contact" className="clean-hero__menu-link">Liên hệ</a>
                        <a href="/sustainability" className="clean-hero__menu-link">Bền vững</a>
                    </nav>
                    
                    <div className="clean-hero__auth">
                        <button className="clean-hero__btn clean-hero__btn--outline">Đăng nhập</button>
                        <button 
                            className="clean-hero__btn clean-hero__btn--primary"
                            onClick={() => navigate('/products')}
                        >
                            Mua ngay
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="clean-hero__main">
                <div className="clean-hero__container">
                    {/* Badge */}
                    <div className={`clean-hero__badge ${isVisible ? 'clean-hero__badge--visible' : ''}`}>
                        <span className="clean-hero__badge-icon">🌱</span>
                        <span className="clean-hero__badge-text">Bộ sưu tập thời trang thân thiện môi trường</span>
                        <span className="clean-hero__badge-arrow">→</span>
                    </div>

                    {/* Title */}
                    <h1 className={`clean-hero__title ${isVisible ? 'clean-hero__title--visible' : ''}`}>
                        <span className="clean-hero__title-line">Phong cách bền vững</span>
                        <span className="clean-hero__title-line clean-hero__title-line--accent">
                            cho ngày mai xanh hơn
                        </span>
                    </h1>

                    {/* Description */}
                    <p className={`clean-hero__description ${isVisible ? 'clean-hero__description--visible' : ''}`}>
                        Khám phá bộ sưu tập thời trang có ý thức sinh thái, kết hợp thiết kế thanh lịch 
                        với trách nhiệm môi trường. Mỗi sản phẩm kể một câu chuyện về sự bền vững.
                    </p>

                    {/* Action Buttons */}
                    <div className={`clean-hero__actions ${isVisible ? 'clean-hero__actions--visible' : ''}`}>
                        <button 
                            className="clean-hero__cta clean-hero__cta--primary"
                            onClick={() => navigate('/products')}
                        >
                            <span>Khám phá bộ sưu tập</span>
                        </button>
                        <button 
                            className="clean-hero__cta clean-hero__cta--secondary"
                            onClick={() => navigate('/about')}
                        >
                            <span>Câu chuyện bền vững</span>
                        </button>
                    </div>
                </div>

                {/* Hero Image */}
                <div className={`clean-hero__image-container ${isVisible ? 'clean-hero__image-container--visible' : ''}`}>
                    <div className="clean-hero__image-frame">
                        <img 
                            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2700&h=1440&q=80"
                            alt="Bộ sưu tập thời trang sinh thái"
                            className="clean-hero__image"
                            loading="eager"
                        />
                    </div>
                </div>
            </main>

            {/* Partners Section */}
            <section className="clean-hero__partners">
                <div className="clean-hero__partners-container">
                    <p className="clean-hero__partners-title">Đối tác bền vững của chúng tôi</p>
                    <div className="clean-hero__partners-grid">
                        <div className="clean-hero__partner">
                            <span className="clean-hero__partner-logo">ECO</span>
                        </div>
                        <div className="clean-hero__partner">
                            <span className="clean-hero__partner-logo">GREEN</span>
                        </div>
                        <div className="clean-hero__partner">
                            <span className="clean-hero__partner-logo">SUSTAIN</span>
                        </div>
                        <div className="clean-hero__partner">
                            <span className="clean-hero__partner-logo">NATURE</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CleanHero; 