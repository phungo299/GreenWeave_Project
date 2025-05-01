import React from 'react';
import { FaUserShield, FaFileAlt, FaBell, FaCalendarCheck } from 'react-icons/fa';
import Breadcrumb from '../components/ui/adminbreadcrumb/AdminBreadcrumb.jsx';
import '../assets/css/AdminDashboard.css';

const AdminDashboard = () => {
    const notifications = [
        { id: 1, type: 'security', message: 'Cảnh báo bảo mật: Đăng nhập không thành công', time: '5 phút trước' },
        { id: 2, type: 'system', message: 'Hệ thống vừa được cập nhật lên phiên bản mới', time: '1 giờ trước' },
        { id: 3, type: 'activity', message: 'Báo cáo hoạt động tháng đã sẵn sàng', time: '2 giờ trước' },
    ];

    const quickActions = [
        { id: 1, icon: <FaUserShield />, title: 'Quản lý quyền', description: 'Phân quyền người dùng' },
        { id: 2, icon: <FaFileAlt />, title: 'Báo cáo', description: 'Tạo báo cáo nhanh' },
        { id: 3, icon: <FaCalendarCheck />, title: 'Lịch hẹn', description: 'Xem lịch công việc' },
    ];

    return (
        <div className="gw-admin-dashboard">
            <Breadcrumb />           
            <div className="gw-dashboard-welcome">
                <div className="gw-welcome-text">
                    <h1>Xin chào, Admin!</h1>
                    <p>Đây là tổng quan về hệ thống của bạn</p>
                </div>
                <div className="gw-current-time">
                    {new Date().toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>
            <div className="gw-dashboard-grid">
                <div className="gw-dashboard-notifications">
                    <div className="gw-section-header">
                        <h2>Thông báo mới</h2>
                        <FaBell />
                    </div>
                    <div className="gw-notifications-list">
                        {notifications.map(notification => (
                            <div key={notification.id} className={`gw-notification-item ${notification.type}`}>
                                <div className="gw-notification-content">
                                    <p>{notification.message}</p>
                                    <span>{notification.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="gw-dashboard-quick-actions">
                    <div className="gw-section-header">
                        <h2>Thao tác nhanh</h2>
                    </div>
                    <div className="gw-quick-actions-grid">
                        {quickActions.map(action => (
                            <div key={action.id} className="gw-quick-action-card">
                                <div className="gw-quick-action-icon">
                                    {action.icon}
                                </div>
                                <div className="gw-quick-action-text">
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard; 