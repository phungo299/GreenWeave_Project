import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLoginModal from '../adminpages/adminloginmodal/AdminLoginModal';

const AdminRoute = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(true); // Always show the first modal
    
    // Show modal in all cases when not admin
    useEffect(() => {
        if (isAuthenticated && user && user.role === 'admin') {
            // If admin, hide modal and ensure they're on admin route
            setShowLoginModal(false);
            
            // Auto-redirect admin users to admin dashboard if they're on homepage or other public routes
            const isOnPublicRoute = ['/', '/home', '/products', '/about-us', '/contact'].includes(location.pathname);
            const isOnAdminRoute = location.pathname.startsWith('/admin');
            
            if (isOnPublicRoute && !isOnAdminRoute) {
                navigate('/admin', { replace: true });
            }
        } else {
            // In all other cases, display the modal
            setShowLoginModal(true);
            
            // If logged in but not admin, log out to avoid token conflicts
            if (isAuthenticated && user && user.role !== 'admin') {
                logout(); // Log out the current user
            }
        }
    }, [isAuthenticated, user, logout, location.pathname, navigate]);
    
    // If admin, display admin content
    if (isAuthenticated && user && user.role === 'admin') {
        return <Outlet />;
    }
    
    // In all other cases, display the modal
    return (
        <div>
            <AdminLoginModal 
                isOpen={showLoginModal}
                onClose={() => navigate('/', { replace: true })}
                intendedPath={location.pathname}
            />
            {/* Blank page after modal */}
            <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}></div>
        </div>
    );
};
export default AdminRoute;