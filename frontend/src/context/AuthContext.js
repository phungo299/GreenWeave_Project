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
                    // Ensure compatibility: add _id if only id is present
                    if (!parsedUser._id && parsedUser.id) {
                        parsedUser._id = parsedUser.id;
                    }
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
    const login = async (username, password) => {
        try {
            const loginData = {
                login: username,
                password: password
            };
            
            const response = await authService.login(loginData);
            
            const { message, data } = response;
            
            if (data && data.token) {
                localStorage.setItem('accessToken', data.token);
                const userObj = {
                    id: data.id || data._id,
                    _id: data.id || data._id,
                    username: data.username,
                    email: data.email,
                    role: data.role
                };
                localStorage.setItem('user', JSON.stringify(userObj));
                
                setUser(userObj);
                setIsAuthenticated(true);
                
                // // Auto-redirect admin users to admin dashboard
                // if (data.role === 'admin') {
                //     // Use setTimeout to ensure state is updated first
                //     setTimeout(() => {
                //         window.location.href = '/admin';
                //     }, 100);
                // }
                
                return { 
                    success: true, 
                    message,
                    isAdmin: data.role === 'admin' // Add flag to let Login component know this is admin
                };
            } else {
                return { success: false, message: message || 'Đăng nhập không thành công' };
            }
        } catch (error) {
            console.error('Login error:', error);
            // Forward the error so the component can handle it
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
    const register = async (username, email, password) => {
        try {
            const response = await authService.register({
                username: username,
                email: email,
                password: password
            });
            
            // Nếu đăng ký thành công, lưu email đang chờ xác thực
            if (response && response.data) {
                setVerificationPending(true);
                setPendingEmail(email);
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.message || 'Đăng ký không thành công' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Trả về error object thay vì throw
            return { 
                success: false, 
                error: error.message || error.data?.message || 'Đã xảy ra lỗi kết nối' 
            };
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
            // Trả về error object thay vì throw
            return { 
                success: false, 
                error: error.message || error.data?.message || 'Đã xảy ra lỗi xác thực' 
            };
        }
    };

    // Resend verification email
    const resendVerification = async (email, username) => {
        try {
            const response = await authService.sendNewVerifyEmail(email || pendingEmail, username);
            return { success: true, message: response.message };
        } catch (error) {
            console.error('Resend verification error:', error);
            // Trả về error object thay vì throw
            return { 
                success: false, 
                error: error.message || error.data?.message || 'Đã xảy ra lỗi gửi lại mã' 
            };
        }
    };

    // Check verification status
    const checkVerificationStatus = async (email) => {
        try {
            const response = await authService.checkVerificationStatus(email);
            
            if (!response.isVerified) {
                // If email is not verified, update state
                setPendingEmail(email);
                setVerificationPending(true);
            }
        
            return {
                success: true,
                isVerified: response.isVerified,
                message: response.message
            };
        } catch (error) {
            console.error('Check verification status error:', error);
            // Forward the error so the component can handle it
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
            resendVerification,
            checkVerificationStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 