import React, { useEffect, useState } from 'react';
import '../assets/css/AboutUsPage.css';
import '../assets/css/ModernAnimations.css';
import ab1 from '../assets/images/ab1.png';
import ab2 from '../assets/images/ab2.png';
import Logo from '../assets/images/logo-no-background.png';
import AnimatedSection from '../components/common/AnimatedSection';
import ModernGallery from '../components/common/ModernGallery';
import Footer from '../components/layout/footer/Footer';
import Header from '../components/layout/header/Header';
import DangThuyDuong from '../assets/images/group-member-photo/Dang Thuy Duong.jpg';
import NguyenThiBichMui from '../assets/images/group-member-photo/Nguyen Thi Bich Mui.jpg';
import PhamNgocHuongQuynh from '../assets/images/group-member-photo/Pham Ngoc Huong Quynh.jpg';
import NgoTranAnhPhu from '../assets/images/group-member-photo/Ngo Tran Anh Phu.jpg';
import LeBaoDuy from '../assets/images/group-member-photo/Le Bao Duy.jpg';
import NguyenVanCuong from '../assets/images/group-member-photo/Nguyen Van Cuong.jpg';

// Thêm preset animation variants ở đầu file
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

const AboutUsPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Modern gallery data với better structure
    const galleryImages = [
        { 
            id: 1,
            title: "Chai nhựa PET - Nguyên liệu tái chế chính", 
            url: "https://res.cloudinary.com/dacbvhtgz/image/upload/v1747585584/chai-nhua_eyinh4.jpg" 
        },
        { 
            id: 2,
            title: "Bao bì thân thiện môi trường", 
            url: "https://res.cloudinary.com/dacbvhtgz/image/upload/v1747585736/recycled-mailer-packaging-design-for-kids-clothing-brand_w8g30x.jpg" 
        },
        { 
            id: 3,
            title: "Sản phẩm từ chất liệu bền vững", 
            url: "https://res.cloudinary.com/dacbvhtgz/image/upload/v1747585563/recycled-tote-bag-3_j142it.jpg" 
        }
    ];

    // Team data với real information
    const teamMembers = [
        {
            id: 1,
            name: "Đặng Thùy Dương",
            position: "Người đại diện",
            description: "Chuyên gia chiến lược với tầm nhìn phát triển bền vững",
            image: DangThuyDuong,
            expertise: ["Chiến lược", "Phát triển bền vững", "Quản lý dự án"]
        },
        {
            id: 2,
            name: "Nguyễn Thị Bích Mùi",
            position: "Chief Marketing Officer",
            description: "Chuyên gia marketing với 5+ năm kinh nghiệm trong ngành thời trang",
            image: NguyenThiBichMui,
            expertise: ["Digital Marketing", "Brand Strategy", "Consumer Insights"]
        },
        {
            id: 3,
            name: "Phạm Ngọc Hương Quỳnh",
            position: "Chief Executive Officer",
            description: "Nhà lãnh đạo tầm nhìn với passion về môi trường và đổi mới",
            image: PhamNgocHuongQuynh,
            expertise: ["Leadership", "Business Strategy", "Sustainability"]
        },
        {
            id: 4,
            name: "Ngô Trần Anh Phú",
            position: "Chief Technology Officer",
            description: "Kỹ sư công nghệ với chuyên môn về platform và development",
            image: NgoTranAnhPhu,
            expertise: ["Full-stack Development", "System Architecture", "Innovation"]
        },
        {
            id: 5,
            name: "Lê Bảo Duy",
            position: "Chief Operating Officer",
            description: "Chuyên gia vận hành với kinh nghiệm tối ưu quy trình sản xuất",
            image: LeBaoDuy,
            expertise: ["Operations", "Supply Chain", "Quality Control"]
        },
        {
            id: 6,
            name: "Nguyễn Văn Cường",
            position: "Chief Business Development Officer",
            description: "Chuyên gia phát triển kinh doanh và mở rộng thị trường",
            image: NguyenVanCuong,
            expertise: ["Business Development", "Partnership", "Market Expansion"]
        }
    ];

    return (
        <div className="aboutpage-container">
            <Header />

            {/* Floating Background Orbs */}
            <div className="floating-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="about-us-content">
                {/* Premium Hero Section - Completely Redesigned */}
                <AnimatedSection variants={smoothZoomIn}>
                    <section className="premium-hero-section">
                        <div className="hero-background-gradient"></div>
                        
                        <div className="premium-hero-container">
                            {/* Left Side - Visual Elements */}
                            <div className="hero-visual-section">
                                <AnimatedSection variants={smoothZoomIn} delay={0.3} className="hero-image-card glassmorphism">
                                    <img src={ab1} alt="Sustainable Ocean" className="hero-main-image" />
                                    <div className="image-overlay">
                                        <div className="impact-badge">
                                            <span className="impact-number">100%</span>
                                            <span className="impact-text">Tái chế</span>
                                        </div>
                                    </div>
                                </AnimatedSection>
                                
                                <AnimatedSection variants={smoothZoomIn} delay={0.6} className="hero-logo-card glassmorphism">
                                    <img src={Logo} alt="GreenWeave Logo" className="hero-logo" />
                                    <div className="logo-glow"></div>
                                </AnimatedSection>
                                
                                <AnimatedSection variants={slideUp} delay={0.9} className="hero-secondary-image glassmorphism">
                                    <img src={ab2} alt="Modern Architecture" />
                                </AnimatedSection>
                            </div>
                            
                            {/* Right Side - Content */}
                            <div className="hero-content-section">
                                <AnimatedSection variants={smoothZoomIn} delay={0.4}>
                                    <div className="hero-badge">
                                        <span>🌿 Thời trang bền vững</span>
                                    </div>
                                </AnimatedSection>
                                
                                <AnimatedSection variants={smoothZoomIn} delay={0.6}>
                                    <h1 className="hero-title">
                                        <span className="title-gradient">About</span>
                                        <span className="title-outline">GreenWeave</span>
                                    </h1>
                                </AnimatedSection>
                                
                                <AnimatedSection variants={smoothZoomIn} delay={0.8}>
                                    <div className="hero-description">
                                        <p className="description-highlight">
                                            <strong>GreenWeave</strong> là thương hiệu thời trang bền vững tiên phong 
                                            trong việc tái tạo giá trị từ rác thải nhựa.
                                        </p>
                                        <p className="description-detail">
                                            Chúng tôi chuyên cung cấp các sản phẩm thời trang như mũ, nón bucket, 
                                            túi tote làm từ <strong>sợi vải tái chế PET</strong>, góp phần giảm thiểu 
                                            ô nhiễm môi trường và lan toả lối sống xanh đến cộng đồng.
                                        </p>
                                    </div>
                                </AnimatedSection>
                                

                            </div>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Premium Values Section */}
                <AnimatedSection variants={fadeIn}>
                    <section className="premium-values-section">
                        <div className="values-container">
                            <AnimatedSection variants={slideUp} delay={0.2}>
                                <h2 className="section-title gradient-text">Giá trị cốt lõi</h2>
                                <p className="section-subtitle">
                                    Những nguyên tắc dẫn lối cho sứ mệnh phát triển bền vững của chúng tôi
                                </p>
                            </AnimatedSection>
                            
                            <div className="values-grid">
                                <AnimatedSection variants={slideUp} delay={0.3} className="value-card glassmorphism">
                                    <div className="value-icon">🌱</div>
                                    <h3>Bền vững</h3>
                                    <p>100% nguyên liệu tái chế từ chai nhựa PET, giảm thiểu tác động môi trường</p>
                                </AnimatedSection>
                                
                                <AnimatedSection variants={slideUp} delay={0.4} className="value-card glassmorphism">
                                    <div className="value-icon">✨</div>
                                    <h3>Chất lượng</h3>
                                    <p>Sản phẩm bền bỉ, thiết kế hiện đại, đáp ứng tiêu chuẩn quốc tế</p>
                                </AnimatedSection>
                                
                                <AnimatedSection variants={slideUp} delay={0.5} className="value-card glassmorphism">
                                    <div className="value-icon">🤝</div>
                                    <h3>Trách nhiệm</h3>
                                    <p>Cam kết với cộng đồng và hành tinh, tạo ra tác động tích cực lâu dài</p>
                                </AnimatedSection>
                            </div>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Enhanced Unique Points section */}
                <AnimatedSection variants={fadeIn}>
                    <section className="premium-unique-section">
                        <div className="unique-container">
                            <AnimatedSection variants={smoothZoomIn} delay={0.2} className="unique-content">
                                <h2 className="section-title gradient-text">Điểm khác biệt</h2>
                                <div className="unique-features">
                                    <AnimatedSection variants={slideUp} delay={0.4} className="feature-item">
                                        <div className="feature-icon">♻️</div>
                                        <div className="feature-text">
                                            <h3>Công nghệ tái chế tiên tiến</h3>
                                            <p>Sử dụng <strong>sợi vải tái chế từ chai nhựa PET</strong> với công nghệ 
                                            hiện đại, tạo ra vật liệu bền vững và thân thiện môi trường.</p>
                                        </div>
                                    </AnimatedSection>
                                    
                                    <AnimatedSection variants={slideUp} delay={0.6} className="feature-item">
                                        <div className="feature-icon">🌍</div>
                                        <div className="feature-text">
                                            <h3>Quy trình sản xuất xanh</h3>
                                            <p>Tích hợp <strong>giá trị bền vững</strong> trong mỗi công đoạn sản xuất, 
                                            từ nguyên liệu đến bao bì, đảm bảo tối thiểu tác động môi trường.</p>
                                        </div>
                                    </AnimatedSection>
                                </div>
                            </AnimatedSection>
                            
                            <AnimatedSection variants={smoothZoomIn} delay={0.4} className="modern-gallery-container">
                                <ModernGallery 
                                    images={galleryImages}
                                    autoplay={true}
                                    autoplayDelay={4000}
                                    showNavigation={true}
                                    className="unique-points-gallery"
                                    style={{ height: '300px' }}
                                />
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Premium Design section */}
                <AnimatedSection variants={fadeIn}>
                    <section className="premium-design-section">
                        <AnimatedSection variants={slideUp} delay={0.2} className="design-header">
                            <h2 className="section-title gradient-text">Thiết kế hiện đại</h2>
                            <p className="section-subtitle">
                                Kết hợp thẩm mỹ đương đại với giá trị bền vững, tạo nên phong cách sống xanh
                            </p>
                        </AnimatedSection>
                        
                        <div className="design-showcase">
                            <AnimatedSection variants={smoothZoomIn} delay={0.3} hoverEffect="float" className="design-item glassmorphism">
                                <img src="https://picsum.photos/300/400?random=12" alt="Sustainable Design 1" />
                                <div className="design-overlay">
                                    <h3>Túi Tote Eco</h3>
                                    <p>Thiết kế tối giản, tiện dụng</p>
                                </div>
                            </AnimatedSection>
                            
                            <AnimatedSection variants={smoothZoomIn} delay={0.4} hoverEffect="float" className="design-item glassmorphism">
                                <img src="https://picsum.photos/300/400?random=13" alt="Sustainable Design 2" />
                                <div className="design-overlay">
                                    <h3>Nón Bucket Premium</h3>
                                    <p>Phong cách streetwear hiện đại</p>
                                </div>
                            </AnimatedSection>
                            
                            <AnimatedSection variants={smoothZoomIn} delay={0.5} hoverEffect="float" className="design-item glassmorphism">
                                <img src="https://picsum.photos/300/400?random=14" alt="Sustainable Design 3" />
                                <div className="design-overlay">
                                    <h3>Mũ Cap Classic</h3>
                                    <p>Đa dạng màu sắc, cá tính</p>
                                </div>
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>

                {/* PREMIUM Team Section - Executive Level */}
                <AnimatedSection variants={fadeIn}>
                    <section className="premium-team-section">
                        <div className="team-header">
                            <AnimatedSection variants={slideUp} delay={0.2}>
                                <h2 className="section-title gradient-text">Đội ngũ lãnh đạo</h2>
                                <p className="section-subtitle">
                                    Những tài năng trẻ với tầm nhìn và passion thay đổi thế giới
                                </p>
                            </AnimatedSection>
                        </div>
                        
                        <div className="premium-team-grid">
                            {teamMembers.map((member, index) => (
                                <AnimatedSection 
                                    key={member.id}
                                    variants={smoothZoomIn} 
                                    delay={0.3 + index * 0.1} 
                                    hoverEffect="float" 
                                    className="premium-team-card glassmorphism"
                                >
                                    <div className="team-card-header">
                                        <div className="member-image-container">
                                            <img src={member.image} alt={member.name} className="member-image" />
                                            <div className="image-glow"></div>
                                        </div>
                                        <div className="member-status">
                                            <span className="status-dot"></span>
                                            <span>Active</span>
                                        </div>
                                    </div>
                                    
                                    <div className="team-card-content">
                                        <h3 className="member-name">{member.name}</h3>
                                        <p className="member-position">{member.position}</p>
                                        <p className="member-description">{member.description}</p>
                                        
                                        <div className="member-expertise">
                                            {member.expertise.map((skill, skillIndex) => (
                                                <span key={skillIndex} className="expertise-tag">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="team-card-footer">
                                        <div className="social-links">
                                            <span className="social-icon">💼</span>
                                            <span className="social-icon">📧</span>
                                            <span className="social-icon">🔗</span>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            ))}
                        </div>
                    </section>
                </AnimatedSection>

                {/* Premium Commitment section */}
                <AnimatedSection variants={fadeIn}>
                    <section className="premium-commitment-section">
                        <div className="commitment-container">
                            <AnimatedSection variants={smoothZoomIn} delay={0.3} className="commitment-visual glassmorphism">
                                <img src="https://picsum.photos/600/400?sustainability" alt="Sustainable Future" />
                                <div className="visual-overlay">
                                    <div className="overlay-content">
                                        <h3>Tương lai bền vững</h3>
                                        <p>Cùng nhau xây dựng thế giới xanh</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                            
                            <AnimatedSection variants={slideUp} delay={0.5} className="commitment-content">
                                <h2 className="section-title gradient-text">Cam kết của chúng tôi</h2>
                                
                                <div className="commitment-list">
                                    <div className="commitment-item">
                                        <div className="commitment-icon">🌱</div>
                                        <div className="commitment-text">
                                            <h3>Nguyên liệu xanh 100%</h3>
                                            <p>Chỉ sử dụng nguyên liệu tái chế và thân thiện với môi trường</p>
                                        </div>
                                    </div>
                                    
                                    <div className="commitment-item">
                                        <div className="commitment-icon">🧪</div>
                                        <div className="commitment-text">
                                            <h3>Không hóa chất độc hại</h3>
                                            <p>Cam kết quy trình sản xuất an toàn, không sử dụng chất độc hại</p>
                                        </div>
                                    </div>
                                    
                                    <div className="commitment-item">
                                        <div className="commitment-icon">⭐</div>
                                        <div className="commitment-text">
                                            <h3>Chất lượng & Dịch vụ</h3>
                                            <p>Đảm bảo chất lượng bền vững và trải nghiệm khách hàng tuyệt vời</p>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>

                {/* ULTRA PREMIUM Call to Action Section - SMOOTH ANIMATIONS */}
                <AnimatedSection variants={smoothZoomIn} delay={0.2}>
                    <section className="ultra-premium-cta-section">
                        {/* Floating Orbs Background */}
                        <div className="cta-floating-orbs">
                            <div className="floating-orb orb-1"></div>
                            <div className="floating-orb orb-2"></div>
                            <div className="floating-orb orb-3"></div>
                            <div className="floating-orb orb-4"></div>
                        </div>
                        
                        {/* Gradient Background */}
                        <div className="cta-premium-gradient"></div>
                        
                        <div className="cta-premium-container">
                            <AnimatedSection variants={smoothZoomIn} delay={0.4} className="cta-main-content">
                                <div className="cta-badge">
                                    <AnimatedSection variants={smoothZoomIn} animation="pulse" hoverEffect="glow">
                                        <span className="badge-icon">🌱</span>
                                        <span className="badge-text">Tương lai xanh</span>
                                    </AnimatedSection>
                                </div>
                                
                                <h1 className="cta-premium-title">
                                    <span className="title-line-1">Cùng tạo nên</span>
                                    <span className="title-line-2 gradient-text-premium">tương lai xanh</span>
                                </h1>
                                
                                <p className="cta-premium-description">
                                    Hãy tham gia cùng <strong>GreenWeave</strong> trong hành trình 
                                    <span className="highlight-text"> phát triển bền vững</span> và 
                                    tạo ra những giá trị thực cho cộng đồng
                                </p>
                                
              
                                
                                <div className="cta-premium-buttons">
                                    <AnimatedSection variants={smoothZoomIn} animation="zoomIn" delay={0.9} hoverEffect="lift">
                                        <button className="cta-btn-ultra primary-premium">
                                            <span className="btn-content">
                                                <span className="btn-icon">🛍️</span>
                                                <span className="btn-text">Khám phá sản phẩm</span>
                                            </span>
                                            <div className="btn-glow"></div>
                                        </button>
                                    </AnimatedSection>
                                    
                                    <AnimatedSection variants={smoothZoomIn} animation="zoomIn" delay={1.0} hoverEffect="lift">
                                        <button className="cta-btn-ultra secondary-premium">
                                            <span className="btn-content">
                                                <span className="btn-icon">💬</span>
                                                <span className="btn-text">Liên hệ với chúng tôi</span>
                                            </span>
                                            <div className="btn-border-glow"></div>
                                        </button>
                                    </AnimatedSection>
                                </div>
                                
                                <AnimatedSection variants={fadeIn} delay={1.2} className="cta-trust-indicators">
                                    <div className="trust-item">
                                        <span className="trust-icon">🔒</span>
                                        <span className="trust-text">Cam kết chất lượng</span>
                                    </div>
                                    <div className="trust-item">
                                        <span className="trust-icon">🚚</span>
                                        <span className="trust-text">Giao hàng toàn quốc</span>
                                    </div>
                                    <div className="trust-item">
                                        <span className="trust-icon">🌿</span>
                                        <span className="trust-text">100% thân thiện môi trường</span>
                                    </div>
                                </AnimatedSection>
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUsPage;
