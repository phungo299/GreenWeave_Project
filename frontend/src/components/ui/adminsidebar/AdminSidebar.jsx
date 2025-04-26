import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import StatisticsIcon from '../../../assets/icons/statistical.png';
import ProductsIcon from '../../../assets/icons/eco-product.png';
import OrdersIcon from '../../../assets/icons/order.png';
import CustomersIcon from '../../../assets/icons/user.png';
import ReviewsIcon from '../../../assets/icons/customer-review.png';
import SettingsIcon from '../../../assets/icons/setting.png';
import ExitIcon from '../../../assets/icons/exit.png';
import './AdminSidebar.css';
import Logo from '../../../assets/images/logo-no-background.png';

const AdminSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Check the current route to determine which menu item is active
    const isActive = (path) => {
        if (path === '/admin' && currentPath === '/admin') {
            return true;
        }
        return currentPath.startsWith(path) && path !== '/admin';
    };

    return (
        <div className="gw-admin-sidebar">
            <div className="gw-admin-sidebar-header">
                <img src={Logo} alt="GreenWeave Logo" className="gw-admin-sidebar-logo" />
                <span className="gw-admin-sidebar-title">ADMIN</span>
            </div>     
            <div className="gw-admin-sidebar-menu">
                <Link to="/admin" className={`gw-admin-menu-item ${isActive('/admin') ? 'active' : ''}`}>
                    <div className="gw-admin-menu-icon-wrapper">
                        <img src={StatisticsIcon} alt="Statistics" className="gw-admin-menu-icon" />
                    </div>
                    <span className="gw-admin-menu-text">Thống kê</span>
                </Link>     
                <Link to="/admin/products" className={`gw-admin-menu-item ${isActive('/admin/products') ? 'active' : ''}`}>
                    <div className="gw-admin-menu-icon-wrapper">
                        <img src={ProductsIcon} alt="Products" className="gw-admin-menu-icon" />
                    </div>
                    <span className="gw-admin-menu-text">Sản phẩm</span>
                </Link>    
                <Link to="/admin/orders" className={`gw-admin-menu-item ${isActive('/admin/orders') ? 'active' : ''}`}>
                    <div className="gw-admin-menu-icon-wrapper">
                        <img src={OrdersIcon} alt="Orders" className="gw-admin-menu-icon" />
                    </div>
                    <span className="gw-admin-menu-text">Đơn hàng</span>
                </Link>    
                <Link to="/admin/customers" className={`gw-admin-menu-item ${isActive('/admin/customers') ? 'active' : ''}`}>
                    <div className="gw-admin-menu-icon-wrapper">
                        <img src={CustomersIcon} alt="Customers" className="gw-admin-menu-icon" />
                    </div>
                    <span className="gw-admin-menu-text">Khách hàng</span>
                </Link>       
                <Link to="/admin/reviews" className={`gw-admin-menu-item ${isActive('/admin/reviews') ? 'active' : ''}`}>
                    <div className="gw-admin-menu-icon-wrapper">
                        <img src={ReviewsIcon} alt="Reviews" className="gw-admin-menu-icon" />
                    </div>
                    <span className="gw-admin-menu-text">Đánh giá</span>
                </Link>      
                <Link to="/admin/settings" className={`gw-admin-menu-item ${isActive('/admin/settings') ? 'active' : ''}`}>
                    <div className="gw-admin-menu-icon-wrapper">
                        <img src={SettingsIcon} alt="Settings" className="gw-admin-menu-icon" />
                    </div>
                    <span className="gw-admin-menu-text">Cài đặt</span>
                </Link>
            </div>    
            <div className="gw-admin-menu-footer">
                <Link to="/" className="gw-admin-exit-item">
                    <div className="gw-admin-menu-icon-wrapper">
                        <img src={ExitIcon} alt="Exit" className="gw-admin-exit-icon" />
                    </div>
                    <span>Thoát</span>
                </Link>
            </div>
        </div>
    );
};
export default AdminSidebar; 