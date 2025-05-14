import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/Login.css';
import loginBackground from '../assets/images/login.jpg';
import logoImage from '../assets/images/logo-no-background.png';
import InputField from '../components/ui/inputfield/InputField';
import { useAuth } from '../context/AuthContext';
import ForgotVerifyEmail from './ForgotVerifyEmail';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false); // State to display modal
    const [userEmail, setUserEmail] = useState('');
    
    // Get the redirect path after successful login
    const from = location.state?.from?.pathname || '/';
    
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({
        username: '',
        password: ''
    });

    // Check for verification success message
    useEffect(() => {
        if (location.state?.verificationSuccess) {
            setSuccessMessage('Xác thực email thành công! Vui lòng đăng nhập.');
        } else if (location.state?.registrationSuccess) {
            setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản.');
        }
    }, [location.state]);

    // Real-time validation
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'username':
                if (!value) {
                    error = 'Vui lòng nhập email hoặc tên đăng nhập';
                } else {
                    // Check email format if user enters
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(value)) {
                        error = 'Định dạng email không hợp lệ';
                    }
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Vui lòng nhập mật khẩu';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setCredentials(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Real-time validation
        const error = validateField(name, newValue);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // Remove login error message when user changes input
        if (loginError) {
            setLoginError('');
        }
    };

    const validate = () => {
        const newErrors = {
            username: validateField('username', credentials.username),
            password: validateField('password', credentials.password)
        };
        
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    // Handle when closing authentication modal
    const handleCloseVerifyModal = () => {
        setShowVerifyModal(false);
    };

    // Process when email authentication is successful
    const handleVerificationSuccess = () => {
        setShowVerifyModal(false);
        setSuccessMessage('Xác thực email thành công! Vui lòng đăng nhập.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        if (validate()) {
            setLoading(true);
            try {
                const result = await login(credentials);
                if (result.success) {
                    // Redirect user after successful login
                    navigate(from, { replace: true });
                } else {
                    setLoginError(result.message || 'Đăng nhập không thành công');
                }
            } catch (error) {
                console.error('Login error:', error);
                // Check email authentication errors
                if (error.status === 400 && error.message && error.message.includes('chưa được xác thực')) {
                    // Lấy email từ thông báo lỗi hoặc từ input nếu là email
                    const userEmail = credentials.username.includes('@') ? credentials.username : '';
                    setUserEmail(userEmail);
                    setShowVerifyModal(true);
                } else {
                    // Display appropriate error message based on error type
                    if (error.status === 0) {
                        // Connection error
                        if (error.message && error.message.includes('CORS')) {
                            setLoginError('Lỗi kết nối: Không thể kết nối đến máy chủ. Vui lòng đảm bảo máy chủ đang chạy và cấu hình CORS chính xác.');
                        } else {
                            setLoginError('Lỗi kết nối máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
                        }
                    } else if (error.status === 401) {
                        // Authentication error
                        setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác');
                    } else if (error.status === 400) {
                        // Data error
                        const errorMsg = error.data && typeof error.data === 'object' 
                            ? Object.values(error.data).join(', ') 
                            : error.message || 'Dữ liệu không hợp lệ';
                        setLoginError(errorMsg);
                    } else {
                        setLoginError(error.message || 'Đã xảy ra lỗi khi đăng nhập, vui lòng thử lại sau');
                    }
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${loginBackground})` }}>
            <div className="login-container">
                <div className="login-form-box">
                    <button 
                        className="back-button"
                        onClick={handleBackToHome}
                        aria-label="Quay lại trang chủ"
                    >
                        <FaArrowLeft /> Trang chủ
                    </button>                   
                    <h1 className="login-title">Xin chào!</h1>
                    <p className="login-subtitle">Đăng nhập vào tài khoản của bạn</p>                     
                    {successMessage && (
                        <div className="login-success" role="alert">
                            {successMessage}
                        </div>
                    )}                   
                    {loginError && (
                        <div className="login-error" role="alert">
                            {loginError}
                        </div>
                    )}                                       
                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <InputField
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="Nhập email hoặc tên đăng nhập"
                            required
                            error={errors.username}
                            autoComplete="username"
                            disabled={loading}
                            aria-invalid={!!errors.username}
                            aria-describedby={errors.username ? "username-error" : undefined}
                        />                       
                        <InputField
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu"
                            required
                            error={errors.password}
                            showTogglePassword={true}
                            autoComplete="current-password"
                            disabled={loading}
                            aria-invalid={!!errors.password}
                            aria-describedby={errors.password ? "password-error" : undefined}
                        />                       
                        <div className="form-options">
                            <label className="remember-me">
                                <input 
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={credentials.rememberMe}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <span className="checkbox-label">Lưu mật khẩu</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-password">Quên mật khẩu</Link>
                        </div>                                              
                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Đang xử lý...
                                </>
                            ) : 'Đăng Nhập'}
                        </button>
                    </form>                    
                    
                    <div className="register-prompt">
                        <span>Bạn chưa có tài khoản? </span>
                        <Link to="/register" className="register-link">Đăng Ký</Link>
                    </div>
                </div>                           
                <div className="brand-logo">
                    <div className="logo-wrapper">
                        <img src={logoImage} alt="Greenweave Logo" className="logo-image" />
                    </div>
                </div>
            </div>
            {/* Email verification modal */}
            {showVerifyModal && (
                <div className="verify-modal-overlay">
                    <div className="verify-modal-content">
                        <button className="verify-modal-close" onClick={handleCloseVerifyModal}>×</button>
                        <ForgotVerifyEmail 
                            initialEmail={userEmail} 
                            onVerificationSuccess={handleVerificationSuccess}
                            isModal={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
export default Login;