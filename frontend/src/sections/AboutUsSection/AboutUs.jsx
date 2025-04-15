import React from 'react';
import './AboutUs.css';

import greenBag from '../../assets/images/about-us-image.jpg';
import ecoCaps from '../../assets/images/login.jpg';
import logoImage from '../../assets/images/logo.jpg';

const AboutUs = () => {
    return (
        <section className="about-us-section">
            <div className="about-us-images-container">
                <div className="about-us-left">
                    <div className="about-us-image-wrapper">
                        <img src={greenBag} alt="Eco-friendly green bag" className="about-us-image" />
                    </div>
                </div>
                <div className="about-us-right">
                    <div className="about-us-content-block">
                        <h2 className="about-us-title">Thời trang xanh</h2>
                        <div className="about-us-subtitle-container">
                            <h3 className="about-us-subtitle-line">Một tương lai</h3>
                            <h3 className="about-us-subtitle-line">bền vững</h3>
                        </div>
                        <img src={logoImage} alt="GreenWeave Logo" className="about-us-logo" />
                        <a href="/about" className="about-us-link">Tìm hiểu thêm</a>
                    </div>
                    <div className="about-us-image-wrapper caps-image">
                        <img src={ecoCaps} alt="Sustainable caps" className="about-us-image" />
                    </div>
                </div>
            </div>
        </section>
    );
};
export default AboutUs;
