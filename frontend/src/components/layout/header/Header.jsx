import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Logo from '../../../assets/images/logo.jpg';

const Header = () => {
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
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/product">Product</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </nav>

                <div className="auth-buttons">
                    <Link to="/login" className="login-btn">Login</Link>
                    <Link to="/signup" className="signup-btn">Sign up</Link>
                </div>
            </div>
        </header>
    );
};
export default Header;
