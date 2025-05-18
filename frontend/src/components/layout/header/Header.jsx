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
import './Header.css';

const Header = () => {
    const activeSection = useActiveSection();
    const { scrollToSection } = useScrollToSection();
    const location = useLocation();
    const { getCartCount } = useCart();
    const { isAuthenticated, user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Check if the current URL is a products page
    const isProductsPage = location.pathname === '/products';
    const isAboutUsPage = location.pathname === '/about-us';
    
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
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/">
                        <img src={Logo} alt="GreenWeave Logo" />
                    </Link>
                </div>
                <nav className="nav-menu">
                    <ul>
                    <li className={(!isProductsPage && activeSection === 'home') ? 'active' : ''}>
                            {isProductsPage ? (
                                <Link to="/#home">Home</Link>
                            ) : (
                                <a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Home</a>
                            )}
                        </li>
                        <li className={isProductsPage || (!isProductsPage && activeSection === 'products') ? 'active' : ''}>
                            {isProductsPage ? (
                                <Link to="/#products">Product</Link>
                            ) : (
                                <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>Product</a>
                            )}
                        </li>
                        <li className={isAboutUsPage || (!isProductsPage && activeSection === 'about') ? 'active' : ''}>
                            <Link to="/about-us">About Us</Link>
                        </li>
                        <li className={(!isProductsPage && activeSection === 'contact') ? 'active' : ''}>
                            {isProductsPage ? (
                                <Link to="/#contact">Contact</Link>
                            ) : (
                                <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact</a>
                            )}
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
                                    <img src={userIcon} alt="User" className="user-icon" />
                                </button>
                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-user-info">
                                            <span className="dropdown-username">{user?.username}</span>
                                        </div>
                                        <Link to="/personal" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <span>Personal</span>
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
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/register" className="signup-btn">Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;
