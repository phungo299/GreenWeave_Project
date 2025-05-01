import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminBreadcrumb.css';
import { FaChevronRight } from 'react-icons/fa';

const AdminBreadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    const breadcrumbMap = {
        'admin': 'Dashboard',
        'statistics': 'Thống kê',
        'products': 'Sản phẩm',
        'orders': 'Đơn hàng',
        'customers': 'Khách hàng',
        'reviews': 'Đánh giá',
        'settings': 'Cài đặt'
    };

    return (
        <div className="gw-admin-breadcrumb">
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                return (
                    <React.Fragment key={name}>
                        <Link 
                            to={routeTo}
                            className={`gw-admin-breadcrumb-item ${isLast ? 'active' : ''}`}
                        >
                            {breadcrumbMap[name] || name}
                        </Link>
                        {!isLast && <FaChevronRight className="gw-admin-breadcrumb-separator" />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
export default AdminBreadcrumb;