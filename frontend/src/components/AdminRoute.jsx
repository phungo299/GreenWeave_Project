import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { isAuthenticated, user } = useAuth();
    
    // // Check if the user is logged in and has admin rights
    // if (!isAuthenticated) {
    //     return <Navigate to="/login" replace />;
    // }
    
    // // Check if user has role admin
    // if (user && user.role !== 'admin') {
    //     return <Navigate to="/" replace />;
    // }
    
    // If user is admin, display child components
    return <Outlet />;
};
export default AdminRoute;