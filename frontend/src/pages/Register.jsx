import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Register.css';
import ParticleBackground from '../components/common/ParticleBackground';
import RoyalButton from '../components/ui/button/RoyalButton';
import InputField from '../components/ui/inputfield/InputField';
import { ERROR_MESSAGES, VALIDATION_REGEX, validateUsername, validateEmail, validatePassword } from '../constants/errorMessages';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const { register, verifyEmail, resendVerification, verificationPending, pendingEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Handle page reloads while authentication is in progress
    useEffect(() => {
        if (verificationPending && pendingEmail) {
            setShowVerificationForm(true);
        }
    }, [verificationPending, pendingEmail]);

    // Countdown timer for resend button
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Real-time validation
    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                return validateUsername(value);
            case 'email':
                return validateEmail(value);
            case 'password':
                return validatePassword(value);
            case 'confirmPassword':
                if (!value) return ERROR_MESSAGES.REQUIRED_CONFIRM_PASSWORD;
                if (value !== userData.password) return ERROR_MESSAGES.PASSWORD_MISMATCH;
                return '';
            default:
                return '';
        }
    };

    // Debounced username check
    const checkUsernameUnique = debounce(async (username) => {
        if (username.length >= 8 && VALIDATION_REGEX.USERNAME.test(username)) {
            setCheckingUsername(true);
            try {
                const response = await authService.checkUsername(username);
                if (!response.available) {
                    setErrors(prev => ({
                        ...prev,
                        username: ERROR_MESSAGES.USERNAME_TAKEN
                    }));
                }
            } catch (error) {
                console.error('Username check error:', error);
            } finally {
                setCheckingUsername(false);
            }
        }
    }, 500);

    // Debounced email check
    const checkEmailUnique = debounce(async (email) => {
        if (VALIDATION_REGEX.EMAIL.test(email)) {
            setCheckingEmail(true);
            try {
                const response = await authService.checkEmail(email);
                if (!response.available) {
                    setErrors(prev => ({
                        ...prev,
                        email: ERROR_MESSAGES.EMAIL_TAKEN
                    }));
                }
            } catch (error) {
                console.error('Email check error:', error);
            } finally {
                setCheckingEmail(false);
            }
        }
    }, 500);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        // Check uniqueness for username and email
        if (name === 'username' && value.length >= 8 && VALIDATION_REGEX.USERNAME.test(value)) {
            checkUsernameUnique(value);
        }
        
        if (name === 'email' && VALIDATION_REGEX.EMAIL.test(value)) {
            checkEmailUnique(value);
        }

        // Clear registration error message when user changes input
        if (registerError) {
            setRegisterError('');
        }
    };

    const validate = () => {
        const newErrors = {
            username: validateField('username', userData.username),
            email: validateField('email', userData.email),
            password: validateField('password', userData.password),
            confirmPassword: validateField('confirmPassword', userData.confirmPassword)
        };
        
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error) && !checkingUsername && !checkingEmail;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        setLoading(true);
        setRegisterError('');

        try {
            const result = await register(userData.username, userData.email, userData.password);
            
            if (result.success) {
                setShowVerificationForm(true);
            } else {
                if (result.error) {
                    if (typeof result.error === 'object') {
                        // Handle field-specific errors
                        const fieldErrors = {};
                        Object.keys(result.error).forEach(key => {
                            if (key !== 'message') {
                                fieldErrors[key] = result.error[key];
                            }
                        });
                        setErrors(prev => ({ ...prev, ...fieldErrors }));
                        
                        if (result.error.message) {
                            setRegisterError(result.error.message);
                        }
                    } else {
                        setRegisterError(result.error);
                    }
                } else {
                    setRegisterError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            setRegisterError(error.message || 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setVerificationCode(value);
        
        if (verificationError) {
            setVerificationError('');
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        
        if (!verificationCode || verificationCode.length !== 6) {
            setVerificationError('Vui lòng nhập mã xác thực 6 chữ số');
            return;
        }

        setLoading(true);
        setVerificationError('');

        try {
            const result = await verifyEmail(verificationCode);
            
            if (result.success) {
                navigate('/login', { 
                    state: { 
                        verificationSuccess: true,
                        message: 'Xác thực email thành công! Vui lòng đăng nhập.'
                    } 
                });
            } else {
                setVerificationError(result.error || 'Mã xác thực không hợp lệ');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setVerificationError(error.message || 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;

        setLoading(true);
        try {
            const email = userData.email || pendingEmail;
            const username = userData.username || email.split('@')[0];
            
            const result = await resendVerification(email, username);
            
            if (result.success) {
                setCountdown(60);
                setVerificationError('');
            } else {
                setVerificationError(result.error || 'Không thể gửi lại mã xác thực');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            setVerificationError(error.message || 'Đã xảy ra lỗi khi gửi lại mã xác thực');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    // Email verification form
    if (showVerificationForm) {
        return (
            <>
                <ParticleBackground 
                    particleCount={60}
                    speed={0.8}
                    size={3}
                    opacity={0.7}
                />
                
                <div className="register-page">
                    <div className="register-container">
                        <div className="register-form-box">
                            <button 
                                className="back-button"
                                onClick={handleBackToHome}
                                aria-label="Quay lại trang chủ"
                            >
                                <FaArrowLeft /> Trang chủ
                            </button>
                            
                            <h1 className="register-title">Xác thực email</h1>
                            <p className="register-subtitle">
                                Chúng tôi đã gửi mã xác thực đến email {userData.email || pendingEmail}.<br />
                                Vui lòng kiểm tra hộp thư và nhập mã xác thực.
                            </p>
                            
                            {verificationError && (
                                <div className="register-error" role="alert">
                                    {verificationError}
                                </div>
                            )}
                            
                            <form className="register-form" onSubmit={handleVerifySubmit} noValidate>
                                <InputField
                                    label="Mã xác thực"
                                    type="text"
                                    name="verificationCode"
                                    value={verificationCode}
                                    onChange={handleVerificationCodeChange}
                                    placeholder="Nhập mã xác thực 6 chữ số"
                                    required
                                    error=""
                                    disabled={loading}
                                    maxLength={6}
                                    aria-invalid={!!verificationError}
                                    aria-describedby={verificationError ? "verification-error" : undefined}
                                />
                                
                                <RoyalButton
                                    type="submit"
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    loading={loading}
                                    disabled={loading}
                                    aria-busy={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Xác thực tài khoản'}
                                </RoyalButton>
                            </form>
                            
                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <RoyalButton
                                    variant="outline"
                                    size="medium"
                                    onClick={handleResendCode}
                                    disabled={countdown > 0 || loading}
                                >
                                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                                </RoyalButton>
                                
                                {countdown > 0 && (
                                    <p className="countdown-text">
                                        Bạn có thể yêu cầu gửi lại mã sau {countdown} giây
                                    </p>
                                )}
                            </div>
                            
                            <div className="login-prompt">
                                <span>Đã có tài khoản? </span>
                                <Link to="/login" className="login-link">Đăng Nhập</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ParticleBackground 
                particleCount={60}
                speed={0.8}
                size={3}
                opacity={0.7}
            />
            
            <div className="register-page">
                <div className="register-container">
                    <div className="register-form-box">
                        <button 
                            className="back-button"
                            onClick={handleBackToHome}
                            aria-label="Quay lại trang chủ"
                        >
                            <FaArrowLeft /> Trang chủ
                        </button>
                        
                        <h1 className="register-title">Tạo tài khoản</h1>
                        <p className="register-subtitle">Đăng ký để trải nghiệm dịch vụ của chúng tôi</p>
                        
                        {registerError && (
                            <div className="register-error" role="alert">
                                {registerError}
                            </div>
                        )}
                        
                        <form className="register-form" onSubmit={handleSubmit} noValidate>
                            <InputField
                                label="Tên đăng nhập"
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập"
                                required
                                error={errors.username}
                                disabled={loading}
                                aria-invalid={!!errors.username}
                                aria-describedby={errors.username ? "username-error" : undefined}
                                isChecking={checkingUsername}
                                isValid={userData.username.length >= 8 && !errors.username && !checkingUsername ? true : (errors.username && errors.username !== 'Đang kiểm tra tên đăng nhập...' ? false : null)}
                            />
                            
                            <InputField
                                label="Email"
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                                required
                                error={errors.email}
                                disabled={loading}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                isChecking={checkingEmail}
                                isValid={/\S+@\S+\.\S+/.test(userData.email) && !errors.email && !checkingEmail ? true : (errors.email && errors.email !== 'Đang kiểm tra email...' ? false : null)}
                            />
                            
                            <InputField
                                label="Mật khẩu"
                                type="password"
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                required
                                error={errors.password}
                                showTogglePassword={true}
                                disabled={loading}
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? "password-error" : undefined}
                            />
                            
                            <InputField
                                label="Xác nhận mật khẩu"
                                type="password"
                                name="confirmPassword"
                                value={userData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Xác nhận mật khẩu"
                                required
                                error={errors.confirmPassword}
                                showTogglePassword={true}
                                disabled={loading}
                                aria-invalid={!!errors.confirmPassword}
                                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                            />
                            
                            <RoyalButton
                                type="submit"
                                variant="primary"
                                size="large"
                                fullWidth
                                loading={loading}
                                disabled={loading}
                                aria-busy={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                            </RoyalButton>
                        </form>
                        
                        <div className="login-prompt">
                            <span>Đã có tài khoản? </span>
                            <Link to="/login" className="login-link">Đăng Nhập</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;