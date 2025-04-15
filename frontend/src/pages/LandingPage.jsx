import React from 'react';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import HomeSection from '../sections/HomeSection/Home'; 
import ProductSection from '../sections/ProductSection/Product';
import AboutUs from '../sections/AboutUsSection/AboutUs';
import '../assets/css/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Header />
            <main className="main-content">
                <HomeSection />
                <ProductSection />
                <AboutUs />
            </main>
            <Footer />
        </div>
    );
};
export default LandingPage;
