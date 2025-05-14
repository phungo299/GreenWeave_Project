import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Register.css';
import googleIcon from '../assets/icons/google.png';
import loginBackground from '../assets/images/login.jpg';
import InputField from '../components/ui/inputfield/InputField';
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

    // Countdown time to resend code
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Debounced functions for checking username and email uniqueness
    const checkUsernameUnique = debounce(async (username) => {
        if (!username || username.length < 8) return;
        
        setCheckingUsername(true);
        try {
            const response = await authService.checkUsername(username);
            if (!response.available) {
                setErrors(prev => ({
                    ...prev,
                    username: 'Tên đăng nhập đã được sử dụng'
                }));
            }
        } catch (error) {
            console.error('Error checking username:', error);
        } finally {
            setCheckingUsername(false);
        }
    }, 500);

    const checkEmailUnique = debounce(async (email) => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) return;
        
        setCheckingEmail(true);
        try {
            const response = await authService.checkEmail(email);
            if (!response.available) {
                setErrors(prev => ({
                    ...prev,
                    email: 'Email đã được sử dụng'
                }));
            }
        } catch (error) {
            console.error('Error checking email:', error);
        } finally {
            setCheckingEmail(false);
        }
    }, 500);

    // Real-time validation
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'username':
                if (!value) {
                    error = 'Vui lòng nhập tên đăng nhập';
                } else if (value.length < 8 || value.length > 30) {
                    error = 'Tên đăng nhập phải có độ dài từ 8 đến 30 ký tự';
                } else if (!/^(?:[a-zA-Z0-9_]{8,30})$/.test(value)) {
                    error = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
                } else if (checkingUsername) {
                    error = 'Đang kiểm tra tên đăng nhập...';
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Vui lòng nhập email';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = 'Email không hợp lệ';
                } else if (checkingEmail) {
                    error = 'Đang kiểm tra email...';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Vui lòng nhập mật khẩu';
                } else if (!new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>/?]).{6,30}$').test(value)) {
                    error = 'Mật khẩu phải chứa chữ thường, in hoa, số, ký tự đặc biệt và từ 6 đến 30 ký tự';
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    error = 'Vui lòng xác nhận mật khẩu';
                } else if (value !== userData.password) {
                    error = 'Mật khẩu xác nhận không khớp';
                }
                break;
            default:
                break;
        }
        return error;
    };

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
        if (name === 'username' && value.length >= 8 && /^(?:[a-zA-Z0-9_]{8,30})$/.test(value)) {
            checkUsernameUnique(value);
        }
        
        if (name === 'email' && /\S+@\S+\.\S+/.test(value)) {
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
        if (validate()) {
            setLoading(true);
            try {
                const result = await register(userData);
                if (result.success) {
                    setShowVerificationForm(true);
                    setCountdown(60); // Set 60 second countdown to resend code
                } else {
                    setRegisterError(result.message || 'Đăng ký không thành công');
                }
            } catch (error) {
                console.error('Register error:', error);
                // Display appropriate error message based on error type
                if (error.status === 0) {
                    // Connection error
                    if (error.message && error.message.includes('CORS')) {
                        setRegisterError('Lỗi kết nối: Không thể kết nối đến máy chủ. Vui lòng đảm bảo máy chủ đang chạy và cấu hình CORS chính xác.');
                    } else {
                        setRegisterError('Lỗi kết nối máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
                    }
                } else if (error.status === 400) {
                    // Data validation error
                    const errorMsg = error.data && typeof error.data === 'object' 
                        ? Object.values(error.data).join(', ') 
                        : error.message || 'Dữ liệu không hợp lệ';
                    setRegisterError(errorMsg);
                } else if (error.status === 409) {
                    // Conflict error (email/username already exists)
                    setRegisterError(error.message || 'Email hoặc tên đăng nhập đã được sử dụng.');
                } else {
                    setRegisterError(error.message || 'Đã xảy ra lỗi khi đăng ký, vui lòng thử lại sau');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerificationCodeChange = (e) => {
        const value = e.target.value;
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
        try {
            const result = await verifyEmail(verificationCode);
            if (result.success) {
                // Redirect user to login page after successful verification
                navigate('/login', { state: { verificationSuccess: true } });
            } else {
                setVerificationError(result.message || 'Xác thực không thành công');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setVerificationError('Đã xảy ra lỗi khi xác thực, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;
        
        setLoading(true);
        try {
            const result = await resendVerification();
            if (result.success) {
                setCountdown(60); // Reset countdown time
            } else {
                setVerificationError(result.message || 'Gửi lại mã không thành công');
            }
        } catch (error) {
            console.error('Resend code error:', error);
            setVerificationError('Đã xảy ra lỗi khi gửi lại mã');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
        // Implement Google login in the future
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    // Email verification form
    if (showVerificationForm) {
        return (
            <div className="register-page" style={{ backgroundImage: `url(${loginBackground})` }}>
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
                                type="text"
                                name="verificationCode"
                                value={verificationCode}
                                onChange={handleVerificationCodeChange}
                                placeholder="Nhập mã xác thực"
                                required
                                error=""
                                disabled={loading}
                                maxLength={6}
                                aria-invalid={!!verificationError}
                                aria-describedby={verificationError ? "verification-error" : undefined}
                            />
                            {verificationError && (
                                <div id="verification-error" className="error-message">
                                    {verificationError}
                                </div>
                            )}                            
                            <button 
                                type="submit" 
                                className="register-submit-button"
                                disabled={loading}
                                aria-busy={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Đang xử lý...
                                    </>
                                ) : 'Xác thực tài khoản'}
                            </button>
                        </form>                                         
                        <div className="register-resend">
                            <button 
                                className="register-resend-button" 
                                onClick={handleResendCode}
                                disabled={countdown > 0 || loading}
                            >
                                {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã'}
                            </button>
                        </div>                       
                        <div className="register-login-prompt">
                            <span>Quay lại đăng nhập? </span>
                            <Link to="/login" className="login-link">Đăng Nhập</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page" style={{ backgroundImage: `url(${loginBackground})` }}>
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
                        <button 
                            type="submit" 
                            className="register-submit-button"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Đang xử lý...
                                </>
                            ) : 'Đăng Ký'}
                        </button>
                        <div className="register-divider">
                            <span>hoặc</span>
                        </div>
                        <button 
                            type="button" 
                            className="google-login-button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <img src={googleIcon} alt="Google Icon" />
                            Đăng ký với Google
                        </button>
                    </form>
                    <div className="register-login-prompt">
                        <span>Đã có tài khoản? </span>
                        <Link to="/login" className="login-link">Đăng Nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Register;