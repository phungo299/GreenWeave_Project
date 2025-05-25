import React from 'react';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import HomeSection from '../sections/HomeSection/Home'; 
import ProductSection from '../sections/ProductSection/Product';
import AboutUs from '../sections/AboutUsSection/AboutUs';
import Contact from '../sections/ContactSection/Contact';
import AnimatedSection from '../components/common/AnimatedSection';
import '../assets/css/LandingPage.css';
import '../assets/css/scroll-fix.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Header />
            <main className="main-content">
                {/* Hero Section with Fade In Animation */}
                <AnimatedSection animation="fadeIn" duration={1.2}>
                    <HomeSection />
                </AnimatedSection>
                
                {/* Product Section with Slide Up Animation */}
                <AnimatedSection animation="slideUp" delay={0.3}>
                    <ProductSection />
                </AnimatedSection>
                
                {/* About Us Section with Slide Right Animation */}
                <AnimatedSection animation="slideRight" delay={0.5}>
                    <AboutUs />
                </AnimatedSection>
                
                {/* Contact Section with Slide Left Animation */}
                <AnimatedSection animation="slideLeft" delay={0.7}>
                    <Contact />
                </AnimatedSection>
            </main>
            <Footer />
        </div>
    );
};
export default LandingPage;
