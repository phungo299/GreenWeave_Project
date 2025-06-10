import React, { useState } from 'react';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import AnimatedSection from '../components/common/AnimatedSection';
import '../assets/css/ModernAnimations.css';
import '../assets/css/ContactPage.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        setTimeout(() => {
            console.log('Contact form submitted:', formData);
            
            // Reset the form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            setIsSubmitting(false);
            setSubmitSuccess(true);
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 5000);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: "📍",
            title: "Địa chỉ",
            content: "Khu Đô Thị Mới An Phú Thịnh, Nhơn Bình, Quy Nhơn",
            color: "#059669"
        },
        {
            icon: "📞",
            title: "Điện thoại",
            content: "+84 123 456 789",
            color: "#0891b2"
        },
        {
            icon: "✉️",
            title: "Email",
            content: "contact@greenweave.com",
            color: "#7c3aed"
        },
        {
            icon: "⏰",
            title: "Giờ làm việc",
            content: "Thứ 2 - Thứ 6: 8:00 - 17:00",
            color: "#dc2626"
        }
    ];

    const contactFeatures = [
        {
            icon: "⚡",
            title: "Phản hồi nhanh chóng",
            description: "Cam kết phản hồi trong vòng 24 giờ"
        },
        {
            icon: "🔒",
            title: "Bảo mật thông tin", 
            description: "Thông tin được mã hóa và bảo vệ tuyệt đối"
        },
        {
            icon: "💬",
            title: "Tư vấn chuyên nghiệp",
            description: "Đội ngũ chuyên gia giàu kinh nghiệm"
        },
        {
            icon: "🌱",
            title: "Hỗ trợ bền vững",
            description: "Tư vấn giải pháp thân thiện môi trường"
        }
    ];

    return (
        <div className="premium-contact-page">
            <Header />
            
            {/* ULTRA PREMIUM Hero Section */}
            <section className="premium-contact-hero">
                {/* Floating Orbs Background */}
                <div className="hero-floating-orbs">
                    <div className="floating-orb orb-1"></div>
                    <div className="floating-orb orb-2"></div>
                    <div className="floating-orb orb-3"></div>
                    <div className="floating-orb orb-4"></div>
                </div>
                
                {/* Gradient Overlay */}
                <div className="hero-gradient-overlay"></div>
                
                <div className="container">
                    <AnimatedSection animation="floatIn" delay={0.2} className="hero-content">
                        <div className="hero-badge">
                            <AnimatedSection animation="pulse" hoverEffect="glow">
                                <span className="badge-icon">💬</span>
                                <span className="badge-text">Liên hệ ngay</span>
                            </AnimatedSection>
                        </div>
                        
                        <h1 className="hero-title">
                            <span className="title-line-1">Kết nối với</span>
                            <span className="title-line-2 gradient-text-premium">GreenWeave</span>
                        </h1>
                        
                        <p className="hero-description">
                            Chúng tôi luôn sẵn sàng <strong>lắng nghe</strong> và 
                            <span className="highlight-text"> hỗ trợ bạn</span>. 
                            Hãy chia sẻ ý kiến, góp ý hoặc thắc mắc để cùng nhau 
                            xây dựng tương lai xanh bền vững.
                        </p>
                        
                        <div className="hero-stats">
                            <AnimatedSection animation="scaleInFade" delay={0.4} className="stat-item">
                                <div className="stat-number">24h</div>
                                <div className="stat-label">Phản hồi nhanh</div>
                            </AnimatedSection>
                            <AnimatedSection animation="scaleInFade" delay={0.5} className="stat-item">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">Bảo mật</div>
                            </AnimatedSection>
                            <AnimatedSection animation="scaleInFade" delay={0.6} className="stat-item">
                                <div className="stat-number">500+</div>
                                <div className="stat-label">Khách hài lòng</div>
                            </AnimatedSection>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* PREMIUM Contact Info Section */}
            <section className="premium-contact-info">
                <div className="container">
                    <AnimatedSection animation="slideUp" delay={0.2} className="section-header">
                        <h2 className="section-title">Thông tin liên hệ</h2>
                        <p className="section-subtitle">
                            Nhiều cách để bạn có thể kết nối với chúng tôi
                        </p>
                    </AnimatedSection>
                    
                    <div className="contact-info-premium-grid">
                        {contactInfo.map((info, index) => (
                            <AnimatedSection 
                                key={index}
                                animation="zoomIn" 
                                delay={0.3 + index * 0.1}
                                hoverEffect="lift"
                                className="contact-info-premium-card glassmorphism"
                            >
                                <div className="card-glow" style={{ background: `linear-gradient(135deg, ${info.color}20, transparent)` }}></div>
                                <div className="contact-icon" style={{ color: info.color }}>
                                    {info.icon}
                                </div>
                                <h3 className="contact-title">{info.title}</h3>
                                <p className="contact-content">{info.content}</p>
                                <div className="card-border" style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}80)` }}></div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ULTRA PREMIUM Contact Form Section */}
            <section className="premium-contact-form-section">
                <div className="container">
                    <div className="form-section-container">
                        <AnimatedSection animation="slideRight" delay={0.3} className="form-features-side">
                            <h2 className="form-section-title">Gửi tin nhắn cho chúng tôi</h2>
                            <p className="form-section-description">
                                Điền thông tin vào form bên cạnh và chúng tôi sẽ liên hệ lại 
                                với bạn trong thời gian sớm nhất có thể.
                            </p>
                            
                            <div className="contact-features-premium">
                                {contactFeatures.map((feature, index) => (
                                    <AnimatedSection 
                                        key={index}
                                        animation="slideUp" 
                                        delay={0.5 + index * 0.1}
                                        hoverEffect="glow"
                                        className="feature-premium-item glassmorphism"
                                    >
                                        <div className="feature-icon">{feature.icon}</div>
                                        <div className="feature-content">
                                            <h4 className="feature-title">{feature.title}</h4>
                                            <p className="feature-description">{feature.description}</p>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </AnimatedSection>

                        <AnimatedSection animation="slideLeft" delay={0.5} className="form-container-premium">
                            <div className="form-wrapper-glassmorphism">
                                <form className="premium-contact-form" onSubmit={handleSubmit}>
                                    <div className="form-header">
                                        <h3 className="form-title">Thông tin liên hệ</h3>
                                        <p className="form-subtitle">Vui lòng điền đầy đủ thông tin</p>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Họ và tên *</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isSubmitting}
                                                className="form-input-premium"
                                                placeholder="Nhập họ và tên của bạn"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isSubmitting}
                                                className="form-input-premium"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="phone">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={isSubmitting}
                                                className="form-input-premium"
                                                placeholder="+84 123 456 789"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="subject">Chủ đề *</label>
                                            <select
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                required
                                                disabled={isSubmitting}
                                                className="form-input-premium form-select-premium"
                                            >
                                                <option value="">Chọn chủ đề</option>
                                                <option value="product">Sản phẩm</option>
                                                <option value="order">Đơn hàng</option>
                                                <option value="support">Hỗ trợ kỹ thuật</option>
                                                <option value="partnership">Hợp tác</option>
                                                <option value="feedback">Góp ý</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Tin nhắn *</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isSubmitting}
                                            className="form-input-premium form-textarea-premium"
                                            rows="6"
                                            placeholder="Chia sẻ chi tiết về yêu cầu của bạn..."
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={`form-submit-premium ${isSubmitting ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        <span className="btn-content">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="modern-spinner"></div>
                                                    <span>Đang gửi...</span>
                                                </>
                                            ) : submitSuccess ? (
                                                <>
                                                    <span className="btn-icon">✓</span>
                                                    <span>Đã gửi thành công!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="btn-icon">📤</span>
                                                    <span>Gửi tin nhắn</span>
                                                </>
                                            )}
                                        </span>
                                        <div className="btn-glow"></div>
                                    </button>

                                    {/* SUCCESS MESSAGE PREMIUM */}
                                    {submitSuccess && (
                                        <AnimatedSection animation="scaleInFade" className="success-message-premium glassmorphism">
                                            <div className="success-icon-premium">✓</div>
                                            <div className="success-content-premium">
                                                <h4>Cảm ơn bạn đã liên hệ!</h4>
                                                <p>Chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong vòng 24 giờ.</p>
                                            </div>
                                        </AnimatedSection>
                                    )}
                                </form>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* PREMIUM Map Section */}
            <section className="premium-map-section">
                <div className="container">
                    <AnimatedSection animation="fadeIn" delay={0.2} className="map-section-content">
                        <h2 className="map-section-title">Ghé thăm showroom của chúng tôi</h2>
                        <p className="map-section-description">
                            Trải nghiệm trực tiếp các sản phẩm bền vững tại không gian xanh của GreenWeave
                        </p>
                        
                        <div className="map-container-premium glassmorphism">
                            <div className="map-placeholder-premium">
                                <div className="map-background-gradient"></div>
                                <div className="map-content">
                                    <div className="map-icon-premium">🗺️</div>
                                    <h3>Vị trí showroom</h3>
                                    <p><strong>Khu Đô Thị Mới An Phú Thịnh</strong></p>
                                    <p>Nhơn Bình, Quy Nhơn</p>
                                    <div className="map-features">
                                        <span className="map-feature">🚗 Bãi đỗ xe miễn phí</span>
                                        <span className="map-feature">🌱 Không gian xanh</span>
                                        <span className="map-feature">☕ Café organic</span>
                                    </div>
                                    <button className="map-directions-btn">
                                        <span>Chỉ đường</span>
                                        <span>🧭</span>
                                    </button>
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

export default ContactPage; 