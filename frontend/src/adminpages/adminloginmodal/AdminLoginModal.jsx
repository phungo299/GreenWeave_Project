import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/ui/inputfield/InputField';
import logoImage from '../../assets/images/logo-no-background.png';
import './AdminLoginModal.css';

const AdminLoginModal = ({ isOpen, onClose, intendedPath }) => {
    const navigate = useNavigate();
    const { login, logout, isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    
    // Check and log out current user if not admin
    useEffect(() => {
        if (isAuthenticated && user && user.role !== 'admin') {
            // Log out the current user to avoid token conflicts
            logout();
        }
    }, [isAuthenticated, user, logout]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Make sure you are logged out before logging in again
            if (isAuthenticated) {
                await logout();
            }
            
            const result = await login(credentials);
            if (result.success) {
                if (result.isAdmin) {
                    // If login is successful with admin rights
                    navigate(intendedPath, { replace: true });
                } else {
                    // If not admin
                    setError('Tài khoản không có quyền truy cập trang admin');
                    await logout(); // Log out immediately to avoid conflicts
                }
            } else {
                setError(result.message || 'Đăng nhập không thành công');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.status === 401) {
                setError('Tên đăng nhập hoặc mật khẩu không chính xác');
            } else {
                setError('Lỗi đăng nhập: ' + (error.message || 'Không xác định'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-modal-overlay">
            <div className="admin-login-modal">
                <button className="close-button" onClick={onClose}>×</button>               
                <div className="logo-wrapper" style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <img src={logoImage} alt="Greenweave Logo" style={{ maxWidth: '120px' }} />
                </div>               
                <h2>Đăng nhập Admin</h2>
                <p>Vui lòng đăng nhập với tài khoản admin để tiếp tục</p>
                {isAuthenticated && user && user.role !== 'admin' && (
                    <div className="info-message">
                        Bạn cần đăng nhập bằng tài khoản có quyền admin
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}                
                <form onSubmit={handleSubmit}>
                    <InputField
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        placeholder="Tên đăng nhập"
                        required
                        disabled={loading}
                    />                 
                    <InputField
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Mật khẩu"
                        required
                        showTogglePassword={true}
                        disabled={loading}
                    />                  
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Đang xử lý...
                            </>
                        ) : 'Đăng Nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default AdminLoginModal;