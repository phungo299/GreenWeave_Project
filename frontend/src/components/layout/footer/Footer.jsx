import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import Logo from '../../../assets/images/logo.jpg';
import FacebookIcon from '../../../assets/icons/facebook.png';
import TwitterIcon from '../../../assets/icons/twitter.png';
import InstagramIcon from '../../../assets/icons/instagram.png';
import LinkedInIcon from '../../../assets/icons/linkedin.png';
import YoutubeIcon from '../../../assets/icons/youtube.png';
import LocationIcon from '../../../assets/icons/placeholder.png';
import PhoneIcon from '../../../assets/icons/telephone.png';
import EmailIcon from '../../../assets/icons/email.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <img src={Logo} alt="Greenweave Logo" />
                        <span>Greenweave</span>
                    </Link>
                    <p className="brand-description">
                        Thời trang bền vững cho tương lai xanh. Chúng tôi tạo ra các sản phẩm thời trang từ vật liệu tái chế thân thiện với môi trường.
                    </p>
                </div>
                <div className="footer-links">
                    <div className="footer-section">
                        <h3>Liên kết nhanh</h3>
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li><Link to="/about">About us</Link></li>
                            <li><Link to="/individual">Cá nhân</Link></li>
                            <li><Link to="/collection">Bộ sưu tập</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Danh mục</h3>
                        <ul>
                            <li><Link to="/women">Mũ nón</Link></li>
                            <li><Link to="/women">Áo phông</Link></li>
                            <li><Link to="/bags">Balo</Link></li>
                            <li><Link to="/tote">Túi tote</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Liên hệ</h3>
                        <ul className="contact-info">
                            <li>
                                <img src={LocationIcon} alt="Location" className="contact-icon" />
                                123 Đường Xanh, Quận 1, TP. Quy Nhơn
                            </li>
                            <li>
                                <img src={PhoneIcon} alt="Phone" className="contact-icon" />
                                +84 123 456 789
                            </li>
                            <li>
                                <img src={EmailIcon} alt="Email" className="contact-icon" />
                                info@greenweave.com
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>©2024 Greenweave. All right reserved.</p>
                <div className="social-links">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src={FacebookIcon} alt="Facebook" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src={TwitterIcon} alt="Twitter" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src={InstagramIcon} alt="Instagram" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                        <img src={LinkedInIcon} alt="LinkedIn" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                        <img src={YoutubeIcon} alt="Youtube" />
                    </a>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
