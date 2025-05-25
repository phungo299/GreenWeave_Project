import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../../assets/images/home-background.jpg';
import AnimatedSection from '../../components/common/AnimatedSection';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = Background;
        img.onload = () => {
            setIsLoaded(true);
        };
    }, []);

    const handleBuyNow = () => {
        navigate('/products');
    };

    const handleLearnMore = () => {
        navigate('/about-us');
    };

    return (
        <section id="home" className={`home-section ${isLoaded ? 'loaded' : 'loading'}`}>
            <div className="home-background" style={{ backgroundImage: `url(${Background})` }}>
                <div className="home-container">
                    {/* Color Palette with Animation */}
                    <AnimatedSection animation="slideLeft" delay={0.5} className="color-palette-container">
                        <div className="color-palette">
                            <div className="color-dots">
                                <AnimatedSection animation="zoomIn" delay={0.8} hoverEffect="pulse">
                                    <div className="color-dot black" data-color="Black"></div>
                                </AnimatedSection>
                                <AnimatedSection animation="zoomIn" delay={0.9} hoverEffect="pulse">
                                    <div className="color-dot dark-green" data-color="Dark Green"></div>
                                </AnimatedSection>
                                <AnimatedSection animation="zoomIn" delay={1.0} hoverEffect="pulse">
                                    <div className="color-dot aqua-green" data-color="Aqua Green"></div>
                                </AnimatedSection>
                                <AnimatedSection animation="zoomIn" delay={1.1} hoverEffect="pulse">
                                    <div className="color-dot mint-green" data-color="Mint Green"></div>
                                </AnimatedSection>
                            </div>
                            <AnimatedSection animation="bounce" delay={1.2}>
                                <div className="palette-bubble"></div>
                            </AnimatedSection>
                        </div>
                        <AnimatedSection animation="slideUp" delay={1.3}>
                            <div className="material-text">
                                <div className="material-percentage">100%</div>
                                <div className="material-description">Vật liệu tái chế</div>
                            </div>
                        </AnimatedSection>
                    </AnimatedSection>

                    {/* Brand Content with Animation */}
                    <AnimatedSection animation="slideRight" delay={0.3} className="brand-content">
                        <AnimatedSection animation="slideUp" delay={0.6}>
                            <h1 className="brand-name">Greenweave</h1>
                        </AnimatedSection>
                        
                        <AnimatedSection animation="slideUp" delay={0.8}>
                            <p className="brand-slogan">Thời trang bền vững - Cho tương lai xanh</p>
                        </AnimatedSection>
                        
                        <AnimatedSection animation="slideUp" delay={1.0}>
                            <div className="cta-buttons">
                                <AnimatedSection animation="zoomIn" delay={1.2} hoverEffect="zoom">
                                    <button className="buy-now-btn" onClick={handleBuyNow}>
                                        Mua ngay
                                    </button>
                                </AnimatedSection>
                                <AnimatedSection animation="zoomIn" delay={1.4} hoverEffect="zoom">
                                    <button className="learn-more-link" onClick={handleLearnMore}>
                                        Tìm hiểu thêm
                                    </button>
                                </AnimatedSection>
                            </div>
                        </AnimatedSection>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
};
export default Home;
