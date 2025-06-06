import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopOnNavigate - Tự động scroll về đầu trang khi chuyển route
 * Component này sẽ được đặt trong App.js để hoạt động globally
 */
const ScrollToTopOnNavigate = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when route changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Use 'instant' để scroll ngay lập tức, không có animation
        });
    }, [pathname]);

    // Component này không render gì cả, chỉ có side effect
    return null;
};

export default ScrollToTopOnNavigate; 