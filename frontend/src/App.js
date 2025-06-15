import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import publicRoutes from './routes/publicRoutes';
import privateRoutes from './routes/privateRoutes';
import adminRoutes from './routes/adminRoutes';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AddressProvider } from './context/AddressContext';
import { ToastProvider } from './components/common/Toast';
import Personal from './pages/Personal';
import NotificationContainer from './components/ui/notification/NotificationContainer';
import ScrollToTop from './components/ui/ScrollToTop';
import ScrollToTopOnNavigate from './components/common/ScrollToTopOnNavigate';
import overrideAlert from './utils/overrideAlert';
import visitorLogService from './services/visitorLogService';
import './App.css';
import './assets/css/light-mode-only.css';
import './assets/css/ModernAnimations.css';

function PageTracker() {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth(); // Destructure specific properties
    
    useEffect(() => {
        // Log when path changes with enhanced data
        const path = location.pathname + location.search;
        const authContext = { isAuthenticated, user }; // Recreate minimal context
        visitorLogService.trackPageVisit(path, authContext);      
    }, [location.pathname, location.search, isAuthenticated, user]); // Use specific dependencies
    
    return null;
}

function App() {
    // Override alert function with toast on app start
    React.useEffect(() => {
        // Wait a bit for toast system to be ready
        const timer = setTimeout(() => {
            overrideAlert();
        }, 100);     
        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthProvider>
            <AddressProvider>
            <CartProvider>
                <ToastProvider>
                    <Router>
                    <PageTracker />
                    <div className="app">
                        <Routes>
                            {/* Public Routes */}
                            {publicRoutes.map((route, index) => {
                                const Page = route.component;
                                return <Route key={index} path={route.path} element={<Page />} />;
                            })}                          
                            {/* Private Routes - login required */}
                            {privateRoutes.map((route, index) => {
                                if (route.path !== '/personal/*') {
                                    const Page = route.component;
                                    return (
                                        <Route 
                                            key={`private-${index}`} 
                                            path={route.path} 
                                            element={
                                                <PrivateRoute>
                                                    <Page />
                                                </PrivateRoute>
                                            } 
                                        />
                                    );
                                }
                                return null;
                            })}                           
                            {/* Personal Routes */}
                            <Route 
                                path="/personal/*" 
                                element={
                                    <PrivateRoute>
                                        <Personal />
                                    </PrivateRoute>
                                } 
                            />
                            {/* Admin Routes - admin access required */}
                            <Route path="/admin" element={<AdminRoute />}>
                                <Route element={React.createElement(adminRoutes[0].component)}>
                                    {adminRoutes[0].children.map((route, index) => {
                                        const ChildComponent = route.component;
                                        return (
                                            <Route 
                                                key={`admin-${index}`} 
                                                path={route.path ? `${route.path}` : ''} 
                                                element={<ChildComponent />} 
                                            />
                                        );
                                    })}
                                </Route>
                            </Route>
                        </Routes>                        
                        {/* Global Components */}
                        <ScrollToTopOnNavigate />
                        <ScrollToTop />
                        <NotificationContainer />
                    </div>
                </Router>
                </ToastProvider>
            </CartProvider>
            </AddressProvider>
        </AuthProvider>
    );
}
export default App;