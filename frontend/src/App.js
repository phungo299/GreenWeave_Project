import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import publicRoutes from './routes/publicRoutes';
import privateRoutes from './routes/privateRoutes';
import adminRoutes from './routes/adminRoutes';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Personal from './pages/Personal';
import NotificationContainer from './components/ui/notification/NotificationContainer';
import ToastManager from './components/ui/toast/ToastManager';
import overrideAlert from './utils/overrideAlert';
import './App.css';
import './assets/css/light-mode-only.css';

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
            <CartProvider>
                <Router>
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
                        <NotificationContainer />
                        <ToastManager />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}
export default App;
