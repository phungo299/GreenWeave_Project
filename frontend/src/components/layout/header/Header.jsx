import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cartIcon from '../../../assets/icons/cart.png';
import exitIcon from '../../../assets/icons/exit.png';
import userIcon from '../../../assets/icons/user.png';
import Logo from '../../../assets/images/logo.jpg';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useScrollToSection } from '../../hooks/useScrollToSection';
import imageUtils from '../../../utils/imageUtils';
import './Header.css';

const Header = () => {
    const activeSection = useActiveSection();
    const { scrollToSection } = useScrollToSection();
    const location = useLocation();
    const { getCartCount } = useCart();
    const { isAuthenticated, user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);
    
    // Check if the current URL is a products page
    const isProductsPage = location.pathname === '/products';
    const isAboutUsPage = location.pathname === '/about-us';
    const isPersonalPage = location.pathname.startsWith('/personal');
    

    
    // Scroll effect for header with throttling
    useEffect(() => {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.scrollY;
                    setIsScrolled(scrollTop > 30);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Logout handling
    const handleLogout = () => {
        logout();
        // Close dropdown after logout
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    
    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <div className="logo">
                    <Link to="/">
                        <img src={Logo} alt="GreenWeave Logo" />
                    </Link>
                </div>
                <nav className="nav-menu">
                    <ul>
                        {isAboutUsPage || isProductsPage || isPersonalPage ? (
                            // Menu when on About Us page, Products page, or Personal page
                            <>
                                <li>
                                    <Link to="/">Trang chủ</Link>
                                </li>
                                <li className={isProductsPage ? "active" : ""}>
                                    <Link to="/products">Sản phẩm</Link>
                                </li>
                                <li className={isAboutUsPage ? "active" : ""}>
                                    <Link to="/about-us">Về chúng tôi</Link>
                                </li>
                                <li>
                                    <Link to="/#contact">Liên hệ</Link>
                                </li>
                            </>
                        ) : (
                            // Menu when on landing page
                            <>
                                <li className={(!isProductsPage && activeSection === 'home') ? 'active' : ''}>
                                    <a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Trang chủ</a>
                                </li>
                                <li className={isProductsPage || (!isProductsPage && activeSection === 'products') ? 'active' : ''}>
                                    <Link to="/products">Sản phẩm</Link>
                                </li>
                                <li className={(!isProductsPage && activeSection === 'about') ? 'active' : ''}>
                                    <Link to="/about-us">Về chúng tôi</Link>
                                </li>
                                <li className={(!isProductsPage && activeSection === 'contact') ? 'active' : ''}>
                                    <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Liên hệ</a>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
                <div className="auth-buttons">
                    {isAuthenticated ? (
                        <>
                            <Link to="/cart" className="cart-icon-container">
                                <img src={cartIcon} alt="Shopping Cart" className="cart-icon" />
                                {getCartCount() > 0 && (
                                    <span className="cart-count">{getCartCount()}</span>
                                )}
                            </Link>
                            <div className="user-dropdown" ref={dropdownRef}>
                                <button className="user-icon-button" onClick={toggleDropdown}>
                                    <img 
                                        src={
                                            user?.avatar ? 
                                                imageUtils.getAvatarUrl(user.avatar, 32) : 
                                                userIcon
                                        } 
                                        alt="User" 
                                        className={`user-icon ${user?.avatar ? 'user-avatar' : ''}`} 
                                    />
                                </button>
                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-user-info">
                                            <span className="dropdown-username">{user?.username}</span>
                                        </div>
                                        <Link to="/personal" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <span>Tài khoản cá nhân</span>
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item logout-item">
                                            <img src={exitIcon} alt="Logout" className="dropdown-icon" />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="login-btn">Đăng nhập</Link>
                            <Link to="/register" className="signup-btn">Đăng ký</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
