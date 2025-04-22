import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useActiveSection } from '../../hooks/useActiveSection';
import { useScrollToSection } from '../../hooks/useScrollToSection';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';
import Logo from '../../../assets/images/logo.jpg';
import cartIcon from '../../../assets/icons/cart.png';
// TODO: Add profile icon after API
// import profileIcon from '../../../assets/icons/profile.png';

const Header = () => {
    const activeSection = useActiveSection();
    const { scrollToSection } = useScrollToSection();
    const location = useLocation();
    const { getCartCount } = useCart();
    const { isAuthenticated, user, logout } = useAuth();
    
    // Check if the current URL is a products page
    const isProductsPage = location.pathname === '/products';
    
    // Logout handling
    const handleLogout = () => {
        logout();
        // Redirect to home page after logout if needed
        // navigate('/');
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
                        <li className={(!isProductsPage && activeSection === 'about') ? 'active' : ''}>
                            {isProductsPage ? (
                                <Link to="/#about">About Us</Link>
                            ) : (
                                <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About Us</a>
                            )}
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
                            {/* TODO: Add Profile page after API */}
                            {/* <Link to="/profile" className="profile-btn">Profile</Link> */}
                            <span className="user-name">{user?.username}</span>
                            <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
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
