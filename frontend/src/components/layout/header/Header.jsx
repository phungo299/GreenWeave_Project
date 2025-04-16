import React from 'react';
import { Link } from 'react-router-dom';
import { useActiveSection } from '../../hooks/useActiveSection';
import './Header.css';
import Logo from '../../../assets/images/logo.jpg';

const Header = () => {
    const activeSection = useActiveSection();
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
                        <li className={activeSection === 'home' ? 'active' : ''}>
                            <Link to="/#home">Home</Link>
                        </li>
                        <li className={activeSection === 'products' ? 'active' : ''}>
                            <Link to="/#products">Product</Link>
                        </li>
                        <li className={activeSection === 'about' ? 'active' : ''}>
                            <Link to="/#about">About Us</Link>
                        </li>
                        <li className={activeSection === 'contact' ? 'active' : ''}>
                            <Link to="/#contact">Contact</Link>
                        </li>
                    </ul>
                </nav>
                <div className="auth-buttons">
                    <Link to="/login" className="login-btn">Login</Link>
                    <Link to="/register" className="signup-btn">Sign up</Link>
                </div>
            </div>
        </header>
    );
};
export default Header;
