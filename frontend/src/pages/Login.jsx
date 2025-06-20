import { debounce } from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/Login.css';
import logoImage from '../assets/images/logo-no-background.png';
import ParticleBackground from '../components/common/ParticleBackground';
import RoyalButton from '../components/ui/button/RoyalButton';
import InputField from '../components/ui/inputfield/InputField';
import { ERROR_MESSAGES, VALIDATION_REGEX, validateLoginField } from '../constants/errorMessages';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import ForgotVerifyEmail from './ForgotVerifyEmail';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [checkingAccount, setCheckingAccount] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    
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
        } else if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location.state]);

    // Real-time validation
    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                return validateLoginField(value);
            case 'password':
                return !value ? ERROR_MESSAGES.REQUIRED_PASSWORD : '';
            default:
                return '';
        }
    };

    // Debounced account existence check
    const checkAccountExists = debounce(async (loginValue) => {
        if (!loginValue) return;
        
        // Only check if format is valid
        if (VALIDATION_REGEX.EMAIL.test(loginValue) || VALIDATION_REGEX.USERNAME.test(loginValue)) {
            setCheckingAccount(true);
            try {
                let response;
                if (VALIDATION_REGEX.EMAIL.test(loginValue)) {
                    response = await authService.checkEmail(loginValue);
                } else {
                    response = await authService.checkUsername(loginValue);
                }
                
                // If account is available (not exists), show error
                if (response.available) {
                    const isEmail = VALIDATION_REGEX.EMAIL.test(loginValue);
                    if (isMountedRef.current) {
                        setErrors(prev => ({
                            ...prev,
                            username: isEmail ? ERROR_MESSAGES.EMAIL_NOT_REGISTERED : ERROR_MESSAGES.USERNAME_NOT_REGISTERED
                        }));
                    }
                } else {
                    // Account exists, clear error if it was about non-existence
                    if (isMountedRef.current) {
                        setErrors(prev => ({
                            ...prev,
                            username: (prev.username === ERROR_MESSAGES.EMAIL_NOT_REGISTERED || 
                                     prev.username === ERROR_MESSAGES.USERNAME_NOT_REGISTERED) ? '' : prev.username
                        }));
                    }
                }
            } catch (error) {
                console.error('Account check error:', error);
            } finally {
                if (isMountedRef.current) {
                    setCheckingAccount(false);
                }
            }
        }
    }, 800);

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

        // Check account existence for username field
        if (name === 'username' && !error) {
            checkAccountExists(newValue);
        }

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

    useEffect(() => {
        if (showVerifyModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        
        // Cleanup when component unmount
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [showVerifyModal]);

    // Handle manual verification modal open
    const handleOpenVerifyModal = () => {
        setUserEmail('');
        setShowVerifyModal(true);
    };

    // Handle when closing authentication modal
    const handleCloseVerifyModal = () => {
        setShowVerifyModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        if (isMountedRef.current) {
            setLoading(true);
            setLoginError('');
        }

        try {
            const result = await login(credentials.username, credentials.password);
            
            if (result.success) {
                // Successful login
                navigate(from, { replace: true });
            } else {
                // Handle different error cases
                if (result.error && result.error.message) {
                    if (result.error.message.includes('chưa được xác thực')) {
                        // Account not verified
                        if (isMountedRef.current) {
                            setUserEmail(credentials.username);
                            setShowVerifyModal(true);
                        }
                    } else {
                        if (isMountedRef.current) {
                            setLoginError(result.error.message);
                        }
                    }
                } else {
                    if (isMountedRef.current) {
                        setLoginError(ERROR_MESSAGES.UNKNOWN_ERROR);
                    }
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            if (isMountedRef.current) {
                setLoginError(error.message || ERROR_MESSAGES.CONNECTION_ERROR);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleVerificationSuccess = () => {
        setShowVerifyModal(false);
        setSuccessMessage('Xác thực email thành công! Vui lòng đăng nhập lại.');
        // Clear form
        setCredentials({
            username: '',
            password: '',
            rememberMe: false
        });
    };

    return (
        <>
            <ParticleBackground 
                particleCount={60}
                speed={0.8}
                size={3}
                opacity={0.7}
            />
            
            <div className={`login-page ${showVerifyModal ? 'blur-background' : ''}`}>
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
                                label="Email hoặc tên đăng nhập"
                                type="text"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="Nhập email hoặc tên đăng nhập"
                                required
                                error={errors.username}
                                autoComplete="username"
                                disabled={loading}
                                isChecking={checkingAccount}
                                isValid={!errors.username && credentials.username && !checkingAccount ? true : null}
                                aria-invalid={!!errors.username}
                                aria-describedby={errors.username ? "username-error" : undefined}
                            />
                            
                            <InputField
                                label="Mật khẩu"
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
                                <Link to="/forgot-password" className="forgot-password">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            
                            <RoyalButton
                                type="submit"
                                variant="primary"
                                size="large"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                                aria-busy={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                            </RoyalButton>
                        </form>
                        
                        <div className="register-prompt">
                            <span>Bạn chưa có tài khoản? </span>
                            <Link to="/register" className="register-link">Đăng Ký</Link>
                        </div>
                        <div className="verify-prompt">
                            <span>Chưa xác thực email? </span>
                            <button 
                                className="verify-link"
                                onClick={handleOpenVerifyModal}
                                disabled={loading}
                            >
                                Xác thực ngay
                            </button>
                        </div>
                    </div>
                    
                    <div className="brand-logo">
                        <div className="logo-wrapper">
                            <img src={logoImage} alt="Greenweave Logo" className="logo-image" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Verification Modal */}
            {showVerifyModal && (
                <div className="verify-modal-overlay">
                    <div className="verify-modal-content">
                        <button 
                            className="verify-modal-close"
                            onClick={handleCloseVerifyModal}
                            aria-label="Đóng modal"
                        >
                            ×
                        </button>
                        <ForgotVerifyEmail 
                            initialEmail={userEmail}
                            onVerificationSuccess={handleVerificationSuccess}
                            isModal={true}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;