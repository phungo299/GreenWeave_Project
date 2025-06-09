import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cartIcon from '../../../assets/icons/cart.png';
import exitIcon from '../../../assets/icons/exit.png';
import userIcon from '../../../assets/icons/user.png';
import Logo from '../../../assets/images/logo.jpg';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useScrollToSection } from '../../hooks/useScrollToSection';
import imageUtils from '../../../utils/imageUtils';
import './Header.css';

const Header = () => {
    const { scrollToSection } = useScrollToSection();
    const location = useLocation();
    const { getCartCount } = useCart();
    const { isAuthenticated, user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);
    
    // Determine current page for navigation highlighting
    const isHomePage = location.pathname === '/';
    const isProductsPage = location.pathname === '/products' || location.pathname.startsWith('/products/');
    const isAboutUsPage = location.pathname === '/about-us';
    const isContactPage = location.pathname === '/contact';
    
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

    // Unified navigation handler
    const handleNavigation = (href, sectionId, e) => {
        if (sectionId && isHomePage) {
            // If on homepage and clicking section link, scroll to section
            e.preventDefault();
            scrollToSection(e, sectionId);
        }
        // Otherwise, let Link handle normal navigation
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
                        <li className={isHomePage ? 'active' : ''}>
                            <Link 
                                to="/" 
                                onClick={(e) => handleNavigation('/', 'home', e)}
                            >
                                Trang chủ
                            </Link>
                        </li>
                        <li className={isProductsPage ? 'active' : ''}>
                            <Link to="/products">Sản phẩm</Link>
                        </li>
                        <li className={isAboutUsPage ? 'active' : ''}>
                            <Link to="/about-us">Về chúng tôi</Link>
                        </li>
                        <li className={isContactPage ? 'active' : ''}>
                            <Link to="/contact">
                                Liên hệ
                            </Link>
                        </li>
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
