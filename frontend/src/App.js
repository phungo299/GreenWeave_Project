import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import publicRoutes from './routes/publicRoutes';
import privateRoutes from './routes/privateRoutes';
import PrivateRoute from './components/PrivateRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
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
                            })}
                        </Routes>
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}
export default App;
