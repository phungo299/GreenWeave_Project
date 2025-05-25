import React, { useEffect, useState } from 'react';
import '../assets/css/AboutUsPage.css';
import ab1 from '../assets/images/ab1.png';
import ab2 from '../assets/images/ab2.png';
import Logo from '../assets/images/logo-no-background.png';
import initFlipGallery from '../assets/js/flipGallery';
import AnimatedSection from '../components/common/AnimatedSection';
import Footer from '../components/layout/footer/Footer';
import Header from '../components/layout/header/Header';
import DangThuyDuong from '../assets/images/group-member-photo/Dang Thuy Duong.jpg';
import NguyenThiBichMui from '../assets/images/group-member-photo/Nguyen Thi Bich Mui.jpg';
import PhamNgocHuongQuynh from '../assets/images/group-member-photo/Pham Ngoc Huong Quynh.jpg';
import NgoTranAnhPhu from '../assets/images/group-member-photo/Ngo Tran Anh Phu.jpg';
import LeBaoDuy from '../assets/images/group-member-photo/Le Bao Duy.jpg';
import NguyenVanCuong from '../assets/images/group-member-photo/Nguyen Van Cuong.jpg';

const AboutUsPage = () => {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        try {
            // Dữ liệu hình ảnh cho unique points flip gallery
            const images = [
                { title: "Chai nhựa PET", url: "https://res.cloudinary.com/dacbvhtgz/image/upload/v1747585584/chai-nhua_eyinh4.jpg" },
                { title: "Bao bì thân thiện môi trường", url: "https://res.cloudinary.com/dacbvhtgz/image/upload/v1747585736/recycled-mailer-packaging-design-for-kids-clothing-brand_w8g30x.jpg" },
                { title: "Sản phẩm từ chất liệu bền vững", url: "https://res.cloudinary.com/dacbvhtgz/image/upload/v1747585563/recycled-tote-bag-3_j142it.jpg" }
            ];

            // Preload hình ảnh trong head và kiểm tra khi đã tải xong
            const preloadImages = () => {
                const head = document.head;
                
                // Xóa các thẻ preload cũ nếu có
                const oldLinks = document.querySelectorAll('link[data-flip-preload]');
                oldLinks.forEach(link => link.remove());
                
                // Tạo Promise chứa tất cả việc tải hình ảnh
                const imageLoadPromises = images.map(image => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => resolve();
                        img.onerror = () => {
                            console.warn(`Không thể tải hình ảnh: ${image.url}`);
                            resolve(); // Vẫn resolve ngay cả khi lỗi
                        };
                        img.src = image.url;
                        
                        // Thêm preload link
                        const link = document.createElement('link');
                        link.rel = 'preload';
                        link.href = image.url;
                        link.as = 'image';
                        link.type = 'image/jpeg';
                        link.setAttribute('data-flip-preload', 'true');
                        head.appendChild(link);
                    });
                });
                
                // Khi tất cả hình ảnh đã tải xong
                Promise.all(imageLoadPromises)
                    .then(() => {
                        setImagesLoaded(true);
                        // Khởi tạo flip gallery sau khi ảnh đã tải xong
                        if (typeof initFlipGallery === 'function') {
                            initFlipGallery('unique-flip-gallery', images);
                        }
                    })
                    .catch(err => {
                        console.error('Lỗi khi tải hình ảnh:', err);
                        setImagesLoaded(true); // Vẫn hiển thị gallery ngay cả khi lỗi
                        setHasError(true);
                    });
            };
            
            // Thực hiện preload
            preloadImages();
            
        } catch (error) {
            console.error('Lỗi khởi tạo AboutUsPage:', error);
            setHasError(true);
            setImagesLoaded(true);
        }
        
        // Dọn dẹp khi unmount
        return () => {
            try {
                // Xóa các thẻ preload khi unmount
                const oldLinks = document.querySelectorAll('link[data-flip-preload]');
                oldLinks.forEach(link => link.remove());
            } catch (error) {
                console.warn('Lỗi khi dọn dẹp:', error);
            }
        };
    }, []);

    return (
        <div className="aboutpage-container">
            <Header />

            <div className="about-us-content">
                {/* About Us Header section - Redesigned */}
                <AnimatedSection animation="fadeIn" duration={0.8}>
                    <section className="about-hero-section">
                        <div className="about-hero-container">
                            <AnimatedSection animation="slideRight" delay={0.3} className="left-section-container">
                                <div className="blue-image">
                                    <img src={ab1} alt="Màu xanh đại dương" />
                                </div>
                            </AnimatedSection>
                            
                            <AnimatedSection animation="slideUp" delay={0.5} className="right-section-container">
                                <div className="logo-section">
                                    <img src={Logo} alt="GreenWeave Logo" className="logo-image" />
                                </div>
                                <div className="stairs-image">
                                    <img src={ab2} alt="Cầu thang hiện đại" />
                                </div>
                            </AnimatedSection>
                            
                            <AnimatedSection animation="slideLeft" delay={0.7} className="right-section">
                                <h1 className="about-title">ABOUT US</h1>
                                <div className="about-description">
                                    <p><span className="highlight">GreenWeave</span> là thương hiệu thời trang bền vững tiên phong trong việc tái tạo giá trị từ rác thải nhựa. Chúng tôi chuyên cung cấp các sản phẩm thời trang như mũ, nón bucket, túi tote làm từ <span className="highlight">sợi vải tái chế PET</span>, góp phần giảm thiểu ô nhiễm môi trường và lan toả lối sống xanh đến cộng đồng.</p>
                                </div>
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Section 3 - 100% Recycled with Ocean Image */}
                <AnimatedSection animation="fadeIn">
                    <section className="recycled-ocean-section">
                        <div className="recycled-ocean-container">
                            <div className="recycled-cards">
                                <AnimatedSection animation="slideRight" delay={0.2} className="recycled-card-left">
                                    <img src="https://picsum.photos/500/600?green=1" alt="Túi tái chế màu xanh" className="recycled-bag-image" />
                                </AnimatedSection>
                                
                                <div className="recycled-card-right">
                                    <AnimatedSection animation="slideLeft" delay={0.3} className="recycled-hats-image-container">
                                        <img src="https://picsum.photos/500/300?hats=1" alt="Mũ nón tái chế" className="recycled-hats-image" />
                                    </AnimatedSection>
                                    
                                    <AnimatedSection animation="zoomIn" delay={0.5} className="recycled-badge">
                                        <h2 className="recycled-percentage">100<span className="percentage-symbol">%</span></h2>
                                        <h3 className="recycled-title">VẬT LIỆU TÁI CHẾ</h3>
                                    </AnimatedSection>
                                    
                                    <AnimatedSection animation="fadeIn" delay={0.7} className="recycled-description">
                                        <span className="highlight">Tất cả sản phẩm của chúng tôi được làm từ vật liệu tái chế,
                                        giảm thiểu rác thải nhựa trong đại dương.</span>
                                    </AnimatedSection>
                                </div>
                            </div>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Unique Points section */}
                <AnimatedSection animation="fadeIn">
                    <section className="unique-section">
                        <div className="unique-container">
                            <AnimatedSection animation="slideRight" delay={0.2} className="unique-content">
                                <h1 className="unique-title">Điểm khác biệt</h1>
                                <ul className="unique-list">
                                    <AnimatedSection animation="slideUp" delay={0.4}>
                                        <li>
                                            <span className="bullet-point">•</span>
                                            <p>Sử dụng <span className="highlight-text">sợi vải tái chế từ chai nhựa PET</span> - 
                                            giải pháp <span className="highlight-text">thân thiện môi trường</span>, góp phần 
                                            <span className="highlight-text">giảm thiểu rác thải nhựa.</span></p>
                                        </li>
                                    </AnimatedSection>
                                    
                                    <AnimatedSection animation="slideUp" delay={0.6}>
                                        <li>
                                            <span className="bullet-point">•</span>
                                            <p>Tích hợp <span className="highlight-text">giá trị bền vững</span> trong mỗi công
                                            đoạn sản xuất, từ nguyên liệu đến bao bì.</p>
                                        </li>
                                    </AnimatedSection>
                                </ul>
                            </AnimatedSection>
                            
                            <AnimatedSection animation="zoomIn" delay={0.4} className="flip-gallery-container">
                                {hasError ? (
                                    <div className="gallery-fallback">
                                        <div className="fallback-images">
                                            <img src="https://via.placeholder.com/300x200/4CAF50/white?text=Chai+nhựa+PET" alt="Chai nhựa PET" />
                                            <img src="https://via.placeholder.com/300x200/2196F3/white?text=Bao+bì+thân+thiện" alt="Bao bì thân thiện môi trường" />
                                            <img src="https://via.placeholder.com/300x200/FF9800/white?text=Sản+phẩm+bền+vững" alt="Sản phẩm từ chất liệu bền vững" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div 
                                            id="unique-flip-gallery" 
                                            className={`flip-gallery ${!imagesLoaded ? 'gallery-loading' : ''}`}
                                        >
                                            <div className="top unite"></div>
                                            <div className="bottom unite"></div>
                                            <div className="overlay-top unite"></div>
                                            <div className="overlay-bottom unite"></div>
                                        </div>
                                        <div className="gallery-nav">
                                            <button type="button" data-gallery-nav="-1" title="Previous">&#10094;</button>
                                            <button type="button" data-gallery-nav="1" title="Next">&#10095;</button>
                                        </div>
                                    </>
                                )}
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Design section */}
                <AnimatedSection animation="fadeIn">
                    <section className="design-section">
                        <AnimatedSection animation="slideUp" delay={0.2} className="design-header">
                            <h2 className="design-title">Thiết kế</h2>
                            <p className="design-description">
                                Thiết kế trẻ trung, năng động, phù hợp với xu hướng sống xanh hiện đại.
                            </p>
                        </AnimatedSection>
                        
                        <div className="design-gallery">
                            <AnimatedSection animation="zoomIn" delay={0.3} hoverEffect="zoom">
                                <img src="https://picsum.photos/250/300?random=12" alt="Design example 1" />
                            </AnimatedSection>
                            
                            <AnimatedSection animation="zoomIn" delay={0.4} hoverEffect="zoom">
                                <img src="https://picsum.photos/250/300?random=13" alt="Design example 2" />
                            </AnimatedSection>
                            
                            <AnimatedSection animation="zoomIn" delay={0.5} hoverEffect="zoom">
                                <img src="https://picsum.photos/250/300?random=14" alt="Design example 3" />
                            </AnimatedSection>
                            
                            <AnimatedSection animation="zoomIn" delay={0.6} hoverEffect="zoom">
                                <img src="https://picsum.photos/250/300?random=15" alt="Design example 4" />
                            </AnimatedSection>
                        </div>
                        
                        <AnimatedSection animation="fadeIn" delay={0.7}>
                            <p className="design-custom">
                                Tạo nên tặng trải nghiệm tiện lợi, cho phép khách hàng thiết kế và tùy chỉnh
                                sản phẩm theo sở thích riêng.
                            </p>
                        </AnimatedSection>
                    </section>
                </AnimatedSection>

                {/* Team section */}
                <AnimatedSection animation="fadeIn">
                    <section className="team-section">
                        <AnimatedSection animation="slideUp" delay={0.2}>
                            <h2 className="team-title">Đội ngũ nhân sự</h2>
                            <p className="team-description">
                                GreenWeave là tập hợp của những con người trẻ trung, sáng tạo, giàu tinh thần trách nhiệm
                            </p>
                        </AnimatedSection>                       
                        <div className="team-members">
                            <AnimatedSection animation="zoomIn" delay={0.3} hoverEffect="float" className="team-member">
                                <img src={DangThuyDuong} alt="Đặng Thùy Dương" />
                                <h3>Đặng Thùy Dương</h3>
                                <p>Người đại diện</p>
                            </AnimatedSection>                           
                            <AnimatedSection animation="zoomIn" delay={0.4} hoverEffect="float" className="team-member">
                                <img src={NguyenThiBichMui} alt="Nguyễn Thị Bích Mùi" />
                                <h3>Nguyễn Thị Bích Mùi</h3>
                                <p>CMO</p>
                            </AnimatedSection>                           
                            <AnimatedSection animation="zoomIn" delay={0.5} hoverEffect="float" className="team-member">
                                <img src={PhamNgocHuongQuynh} alt="Phạm Ngọc Hương Quỳnh" />
                                <h3>Phạm Ngọc Hương Quỳnh</h3>
                                <p>CEO</p>
                            </AnimatedSection>                           
                            <AnimatedSection animation="zoomIn" delay={0.6} hoverEffect="float" className="team-member">
                                <img src={NgoTranAnhPhu} alt="Ngô Trần Anh Phú" />
                                <h3>Ngô Trần Anh Phú</h3>
                                <p>CTO</p>
                            </AnimatedSection>                         
                           <AnimatedSection animation="zoomIn" delay={0.7} hoverEffect="float" className="team-member">
                                <img src={LeBaoDuy} alt="Lê Bảo Duy" />
                                <h3>Lê Bảo Duy</h3>
                                <p>COO</p>
                            </AnimatedSection>                           
                            <AnimatedSection animation="zoomIn" delay={0.8} hoverEffect="float" className="team-member">
                                <img src={NguyenVanCuong} alt="Nguyễn Văn Cường" />
                                <h3>Nguyễn Văn Cường</h3>
                                <p>CBDO</p>
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>
                {/* Achievements section */}
                <AnimatedSection animation="fadeIn">
                    <section className="achievements-section">
                        <div className="achievements-container">
                            <AnimatedSection animation="slideRight" delay={0.3} className="achievements-list">
                                <h2>Thành tựu</h2>
                                <ul>
                                    <li>Được nhận tài trợ từ trường Đại học FPT Quy Nhơn</li>
                                    <li>Được giải thưởng hệch văn hóa truyền thông tỉnh và nhiều cuộc thi</li>
                                </ul>
                            </AnimatedSection>
                            
                            <AnimatedSection animation="slideLeft" delay={0.4} className="certificates">
                                <img src="https://picsum.photos/200/300?document" alt="Certificate" />
                            </AnimatedSection>
                        </div>
                    </section>
                </AnimatedSection>

                {/* Certifications section */}
                <AnimatedSection animation="fadeIn">
                    <section className="certification-section">
                        <AnimatedSection animation="slideUp" delay={0.3} className="certification-container">
                            <h2>Chứng nhận</h2>
                            <ul>
                                <li>Đạt giải "Ý tưởng khởi nghiệp sáng tạo vì môi trường" - Phishing Day FPT education" năm 2023</li>
                                <li>Sản phẩm đạt tiêu chuẩn Global Recycled Standard (GRS)</li>
                            </ul>
                        </AnimatedSection>
                    </section>
                </AnimatedSection>

                {/* Commitment section */}
                <AnimatedSection animation="fadeIn">
                    <section className="commitment-section">
                        <div className="commitment-container">
                            <AnimatedSection animation="slideRight" delay={0.3} className="commitment-image">
                                <img src="https://picsum.photos/400/300?clothing" alt="Sustainable clothing" />
                            </AnimatedSection>
                            
                            <AnimatedSection animation="slideLeft" delay={0.5} className="commitment-text">
                                <h2>Lời cam kết</h2>
                                <ul>
                                    <li>Chỉ sử dụng nguyên liệu tái chế và thân thiện với môi trường</li>
                                    <li>Không sử dụng hóa chất độc hại trong quá trình sản xuất</li>
                                    <li>Cam kết chất lượng bền vững, dịch vụ tận tâm và trải nghiệm tích cực cho khách hàng</li>
                                </ul>
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
