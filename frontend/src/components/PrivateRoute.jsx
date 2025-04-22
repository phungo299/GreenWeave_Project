import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // If checking login status, show loading status
    if (loading) {
        // You can create a separate loading component to display here
        return <div className="loading">Loading...</div>;
    }

    // If not logged in, redirect to login page
    if (!isAuthenticated) {
        // Save current path to redirect user after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If logged in, show protected page
    return children;
};
export default PrivateRoute; 