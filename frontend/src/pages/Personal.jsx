import React, { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import PersonalLayout from '../components/layout/personallayout/PersonalLayout';
import OrderList from '../personalpage/order/OrderList';
import OrderDetails from '../personalpage/order/OrderDetails';
import FavoriteList from '../personalpage/favoritelist/FavoriteList';
import PersonalAddress from '../personalpage/address/PersonalAddress';
import ChangePassword from '../personalpage/changepassword/ChangePassword';
import '../assets/css/Personal.css';

const Personal = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
  
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);
  
    if (!isAuthenticated) {
        return null; // or return a loading spinner
    }
  
    return (
        <div className="personal-page-container">
            <Header />
            <div className="personal-page-wrapper">
                <PersonalLayout>
                    <Routes>
                        <Route index element={<OrderList />} />
                        <Route path="orders" element={<OrderList />} />
                        <Route path="orders/:id" element={<OrderDetails />} />
                        <Route path="favorites" element={<FavoriteList />} />
                        <Route path="address" element={<PersonalAddress />} />
                        <Route path="change-password" element={<ChangePassword />} />
                        {/* Add more routes here as components are developed */}
                    </Routes>
                </PersonalLayout>
            </div>
            <Footer />
        </div>
    );
};
export default Personal;