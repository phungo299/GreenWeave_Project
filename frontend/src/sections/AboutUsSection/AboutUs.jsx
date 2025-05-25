import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutUs.css';
import AnimatedSection from '../../components/common/AnimatedSection';

import greenBag from '../../assets/images/about-us-image.jpg';
import ecoCaps from '../../assets/images/login.jpg';
import logoImage from '../../assets/images/logo.jpg';

const AboutUs = () => {
    const navigate = useNavigate();

    const handleLearnMore = () => {
        navigate('/about-us');
    };

    return (
        <section id="about" className="about-us-section">
            <div className="about-us-images-container">
                {/* Left Side with Animation */}
                <AnimatedSection animation="slideLeft" delay={0.3} className="about-us-left">
                    <AnimatedSection animation="zoomIn" delay={0.6} hoverEffect="zoom">
                        <div className="about-us-image-wrapper">
                            <img src={greenBag} alt="Eco-friendly green bag" className="about-us-image" />
                        </div>
                    </AnimatedSection>
                </AnimatedSection>

                {/* Right Side with Animation */}
                <AnimatedSection animation="slideRight" delay={0.5} className="about-us-right">
                    <AnimatedSection animation="slideUp" delay={0.8} className="about-us-content-block">
                        <AnimatedSection animation="slideUp" delay={1.0}>
                            <h2 className="about-us-title">Thời trang xanh</h2>
                        </AnimatedSection>
                        
                        <AnimatedSection animation="slideUp" delay={1.2}>
                            <div className="about-us-subtitle-container">
                                <h3 className="about-us-subtitle-line">Một tương lai</h3>
                                <h3 className="about-us-subtitle-line">bền vững</h3>
                            </div>
                        </AnimatedSection>
                        
                        <AnimatedSection animation="zoomIn" delay={1.4} hoverEffect="pulse">
                            <img src={logoImage} alt="GreenWeave Logo" className="about-us-logo" />
                        </AnimatedSection>
                        
                        <AnimatedSection animation="slideUp" delay={1.6} hoverEffect="zoom">
                            <button onClick={handleLearnMore} className="about-us-link">
                                Tìm hiểu thêm
                            </button>
                        </AnimatedSection>
                    </AnimatedSection>
                    
                    <AnimatedSection animation="zoomIn" delay={1.0} hoverEffect="zoom" className="about-us-image-wrapper caps-image">
                        <img src={ecoCaps} alt="Sustainable caps" className="about-us-image" />
                    </AnimatedSection>
                </AnimatedSection>
            </div>
        </section>
    );
};
export default AboutUs;
