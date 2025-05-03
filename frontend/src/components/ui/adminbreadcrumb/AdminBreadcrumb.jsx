import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminBreadcrumb.css';
import { FaChevronRight } from 'react-icons/fa';

const AdminBreadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    const breadcrumbItems = [];
    let skipNext = false;

    pathnames.forEach((name, index) => {
        if (skipNext) {
            skipNext = false;
            return;
        }
        
        // Check if current path is "edit" and there is next path (ID)
        if (name === "edit" && index < pathnames.length - 1) {
            const id = pathnames[index + 1];
            breadcrumbItems.push({
                name: `Edit (ID: ${id})`,
                path: `/${pathnames.slice(0, index + 2).join('/')}`,
                isLast: index + 1 === pathnames.length - 1
            });
            skipNext = true;
        } 
        // Case where "add" has no ID after it
        else if (name === "add") {
            breadcrumbItems.push({
                name: "Thêm mới",
                path: `/${pathnames.slice(0, index + 1).join('/')}`,
                isLast: index === pathnames.length - 1
            });
        }
        else {
            breadcrumbItems.push({
                name: name,
                path: `/${pathnames.slice(0, index + 1).join('/')}`,
                isLast: index === pathnames.length - 1
            });
        }
    });

    const breadcrumbMap = {
        'admin': 'Dashboard',
        'statistics': 'Thống kê',
        'products': 'Sản phẩm',
        'orders': 'Đơn hàng',
        'users': 'Người dùng',
        'reviews': 'Đánh giá',
        'settings': 'Cài đặt',
        'add': 'Add',
        'edit': 'Edit'
    };

    return (
        <div className="gw-admin-breadcrumb">
            {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;               
                // Define the display label
                let displayName = item.name;
                if (breadcrumbMap[item.name]) {
                    displayName = breadcrumbMap[item.name];
                } else if (item.name.startsWith('Edit')) {
                    // Keep the "Edit (ID)" format
                    displayName = item.name;
                }

                return (
                    <React.Fragment key={index}>
                        <Link 
                            to={item.path}
                            className={`gw-admin-breadcrumb-item ${isLast ? 'active' : ''}`}
                        >
                            {displayName}
                        </Link>
                        {!isLast && <FaChevronRight className="gw-admin-breadcrumb-separator" />}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
export default AdminBreadcrumb;