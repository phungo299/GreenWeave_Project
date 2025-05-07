import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingBag, FaHeart, FaMapMarkerAlt, FaLock, FaUser, FaCog } from 'react-icons/fa';
import './PersonalSidebar.css';

const PersonalSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
  
    return (
        <div className="personal-sidebar-container">
            <ul className="personal-sidebar-menu">
                <li className={`personal-sidebar-item ${currentPath === '/personal' || currentPath === '/personal/orders' ? 'active' : ''}`}>
                    <Link to="/personal/orders" className="personal-sidebar-link">
                        <FaShoppingBag className="personal-sidebar-icon" />
                        Đơn hàng
                    </Link>
                </li>
                <li className={`personal-sidebar-item ${currentPath === '/personal/favorites' ? 'active' : ''}`}>
                    <Link to="/personal/favorites" className="personal-sidebar-link">
                        <FaHeart className="personal-sidebar-icon" />
                        Yêu thích
                    </Link>
                </li>
                <li className={`personal-sidebar-item ${currentPath === '/personal/address' ? 'active' : ''}`}>
                    <Link to="/personal/address" className="personal-sidebar-link">
                        <FaMapMarkerAlt className="personal-sidebar-icon" />
                        Địa chỉ
                    </Link>
                </li>
                <li className={`personal-sidebar-item ${currentPath === '/personal/change-password' ? 'active' : ''}`}>
                    <Link to="/personal/change-password" className="personal-sidebar-link">
                        <FaLock className="personal-sidebar-icon" />
                        Mật khẩu
                    </Link>
                </li>
                <li className={`personal-sidebar-item ${currentPath === '/personal/profile' ? 'active' : ''}`}>
                    <Link to="/personal/profile" className="personal-sidebar-link">
                        <FaUser className="personal-sidebar-icon" />
                        Thông tin cá nhân
                    </Link>
                </li>
                <li className="personal-sidebar-item">
                    <Link to="/logout" className="personal-sidebar-link">
                        <FaCog className="personal-sidebar-icon" />
                        Cài đặt cá nhân
                    </Link>
                </li>
            </ul>
        </div>
    );
};
export default PersonalSidebar;