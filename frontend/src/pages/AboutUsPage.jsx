import React from 'react';
import Header from '../components/layout/header/Header';
import '../assets/css/AboutUsPage.css';
import logo from '../assets/images/logo.jpg';
import sewing from '../assets/images/about-us-image.jpg';
import fabric from '../assets/images/about-us-image.jpg';
import recycledBag from '../assets/images/about-us-image.jpg';
import caps from '../assets/images/cap-3.jpg';

const AboutUsPage = () => {
    return (
        <div className="aboutpage-container">
            <Header />
            {/* Hero Section */}
            <section className="aboutpage-hero-section">
                <div className="aboutpage-hero-content">                  
                    <div className="aboutpage-main-content">
                        <div className="aboutpage-layout">
                            <div className="aboutpage-left-content">
                                <div className="aboutpage-image-wrapper">
                                    <div className="aboutpage-logo-center">
                                        <img src={logo} alt="GreenWeave Logo" />
                                    </div>
                                    <div className="aboutpage-image-bottom">
                                        <img src={sewing} alt="Sewing tools" />
                                    </div>
                                    <div className="aboutpage-image-top">
                                        <img src={fabric} alt="Sustainable fabric" />
                                    </div>
                                    <div className="aboutpage-ratings">
                                        <h4>Best ratings</h4>
                                        <div className="aboutpage-emojis">
                                            <span>😍</span>
                                            <span>😀</span>
                                            <span>😁</span>
                                            <span>😄</span>
                                            <span>😊</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="aboutpage-right-content">
                                <h1>ABOUT US</h1>
                                <p className="aboutpage-description">
                                    <span className="brand-highlight">GreenWeave</span> là thương hiệu thời trang bền vững tiên phong trong việc tái tạo giá trị từ rác thải nhựa. 
                                    Chúng tôi chuyên cung cấp các sản phẩm thời trang như mũ, nón bucket, túi tote làm từ <span className="highlight">sợi vải tái chế PET</span>, 
                                    góp phần giảm thiểu ô nhiễm môi trường và lan toả lối sống xanh đến cộng đồng.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Recycled Materials Section */}
            <section className="aboutpage-recycled-section">
                <div className="aboutpage-recycled-content">
                    <div className="aboutpage-recycled-image">
                        <img src={recycledBag} alt="Recycled bag" />
                    </div>
                    <div className="aboutpage-recycled-info">
                        <div className="aboutpage-caps-image">
                            <img src={caps} alt="Caps" />
                        </div>
                        <div className="aboutpage-recycled-badge">
                            <h2>100<span className="percentage">%</span></h2>
                            <h3>VẬT LIỆU TÁI CHẾ</h3>
                        </div>
                        <p className="aboutpage-recycled-description">
                            Tất cả sản phẩm của chúng tôi được làm từ vật liệu tái chế, 
                            giảm thiểu rác thải nhựa trong đại dương.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default AboutUsPage;