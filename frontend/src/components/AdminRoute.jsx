import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLoginModal from '../adminpages/adminloginmodal/AdminLoginModal.jsx';

const AdminRoute = () => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);
    
    useEffect(() => {
        // When authentication status changes, update modal display
        setShowLoginModal(!isAuthenticated);
    }, [isAuthenticated]);
    
    // User is logged in
    if (isAuthenticated) {
        // Check admin rights
        if (user && user.role === 'admin') {
            return <Outlet />;
        } else {
            // Not admin, redirect to home page
            return <Navigate to="/" replace />;
        }
    } else {
        // Not logged in, show modal instead of redirect
        return (
            <div>
                <AdminLoginModal 
                    isOpen={showLoginModal}
                    onClose={() => navigate('/', { replace: true })}
                    intendedPath={location.pathname}
                />
            </div>
        );
    }
};
export default AdminRoute;