import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [verificationPending, setVerificationPending] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    // Check token in localStorage when component is mounted
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                }
            }
            
            setLoading(false);
        };
        
        checkToken();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            const loginData = {
                login: credentials.username,
                password: credentials.password
            };
            
            const response = await authService.login(loginData);
            
            const { message, data } = response;
            
            if (data && data.token) {
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    role: data.role
                }));
                
                setUser({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    role: data.role
                });
                setIsAuthenticated(true);
                return { success: true, message };
            } else {
                return { success: false, message: message || 'Đăng nhập không thành công' };
            }
        } catch (error) {
            console.error('Login error:', error);
            // Chuyển tiếp lỗi để component có thể xử lý
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Registration function
    const register = async (userData) => {
        try {
            const response = await authService.register({
                username: userData.username,
                email: userData.email,
                password: userData.password
            });
            
            // Nếu đăng ký thành công, lưu email đang chờ xác thực
            if (response.data) {
                setVerificationPending(true);
                setPendingEmail(userData.email);
                return { success: true, data: response.data };
            } else {
                return { success: false, message: response.message || 'Đăng ký không thành công' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Chuyển tiếp lỗi để component có thể xử lý
            throw error;
        }
    };

    // Verify email function
    const verifyEmail = async (verificationCode) => {
        try {
            const response = await authService.verifyEmail(verificationCode);
            setVerificationPending(false);
            setPendingEmail('');
            return { success: true, message: response.message };
        } catch (error) {
            console.error('Email verification error:', error);
            // Chuyển tiếp lỗi để component có thể xử lý
            throw error;
        }
    };

    // Resend verification email
    const resendVerification = async (email) => {
        try {
            const response = await authService.sendNewVerifyEmail(email || pendingEmail);
            return { success: true, message: response.message };
        } catch (error) {
            console.error('Resend verification error:', error);
            // Chuyển tiếp lỗi để component có thể xử lý
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            verificationPending,
            pendingEmail,
            login,
            logout,
            register,
            verifyEmail,
            resendVerification
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 