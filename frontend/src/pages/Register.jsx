import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Register.css';
import googleIcon from '../assets/icons/google.png';
import loginBackground from '../assets/images/login.jpg';
import logoImage from '../assets/images/logo.jpg';
import InputField from '../components/ui/inputfield/InputField';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, verifyEmail, resendVerification, verificationPending, pendingEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [countdown, setCountdown] = useState(0);
    
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

    // Xử lý trường hợp tải lại trang khi đang trong quá trình xác thực
    useEffect(() => {
        if (verificationPending && pendingEmail) {
            setShowVerificationForm(true);
        }
    }, [verificationPending, pendingEmail]);

    // Đếm ngược thời gian để gửi lại mã
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        // Clear registration error message when user changes input
        if (registerError) {
            setRegisterError('');
        }
    };

    const validate = () => {
        const newErrors = {};
        let isValid = true;
        
        if (!userData.username) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
            isValid = false;
        } else if (userData.username.length < 8 || userData.username.length > 30) {
            newErrors.username = 'Tên đăng nhập phải có độ dài từ 8 đến 30 ký tự';
            isValid = false;
        } else if (!/^(?:[a-zA-Z0-9_]{8,30})$/.test(userData.username)) {
            newErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
            isValid = false;
        }
        
        if (!userData.email) {
            newErrors.email = 'Vui lòng nhập email';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Email không hợp lệ';
            isValid = false;
        }
        
        if (!userData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            isValid = false;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{6,30}$/.test(userData.password)) {
            newErrors.password = 'Mật khẩu phải chứa chữ thường, in hoa, số, ký tự đặc biệt và từ 6 đến 30 ký tự';
            isValid = false;
        }

        if (!userData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            isValid = false;
        } else if (userData.confirmPassword !== userData.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        if (validate()) {
            setLoading(true);
            try {
                const result = await register(userData);
                if (result.success) {
                    setShowVerificationForm(true);
                    setCountdown(60); // Đặt thời gian đếm ngược 60 giây để gửi lại mã
                } else {
                    setRegisterError(result.message || 'Đăng ký không thành công');
                }
            } catch (error) {
                console.error('Register error:', error);
                // Hiển thị thông báo lỗi phù hợp dựa trên loại lỗi
                if (error.status === 0) {
                    // Lỗi kết nối
                    if (error.message && error.message.includes('CORS')) {
                        setRegisterError('Lỗi kết nối: Không thể kết nối đến máy chủ. Vui lòng đảm bảo máy chủ đang chạy và cấu hình CORS chính xác.');
                    } else {
                        setRegisterError('Lỗi kết nối máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
                    }
                } else if (error.status === 400) {
                    // Lỗi xác thực dữ liệu
                    const errorMsg = error.data && typeof error.data === 'object' 
                        ? Object.values(error.data).join(', ') 
                        : error.message || 'Dữ liệu không hợp lệ';
                    setRegisterError(errorMsg);
                } else if (error.status === 409) {
                    // Lỗi xung đột (email/username đã tồn tại)
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
                setCountdown(60); // Đặt lại thời gian đếm ngược
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
        // Triển khai đăng nhập Google trong tương lai
    };

    // Form xác thực email
    if (showVerificationForm) {
        return (
            <div className="register-page" style={{ backgroundImage: `url(${loginBackground})` }}>
                <div className="register-container">
                    <div className="register-form-box">
                        <h1 className="register-title">Xác thực email</h1>
                        <p className="register-subtitle">
                            Chúng tôi đã gửi mã xác thực đến email {userData.email || pendingEmail}.<br />
                            Vui lòng kiểm tra hộp thư và nhập mã xác thực.
                        </p>                    
                        {verificationError && <div className="register-error">{verificationError}</div>}                    
                        <form className="register-form" onSubmit={handleVerifySubmit}>
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
                            />                      
                            <button 
                                type="submit" 
                                className="register-submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác thực tài khoản'}
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
                            <Link to="/login" className="register-login-link">Đăng nhập</Link>
                        </div>
                    </div>            
                    <div className="register-brand-logo">
                        <div className="register-logo-wrapper">
                            <img src={logoImage} alt="Greenweave Logo" className="register-logo-image" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Form đăng ký
    return (
        <div className="register-page" style={{ backgroundImage: `url(${loginBackground})` }}>
            <div className="register-container">
                <div className="register-form-box">
                    <h1 className="register-title">Tạo tài khoản</h1>
                    <p className="register-subtitle">Bắt đầu với Greenweave!</p>                    
                    {registerError && <div className="register-error">{registerError}</div>}                    
                    <form className="register-form" onSubmit={handleSubmit}>
                        <InputField
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            placeholder="Tên đăng nhập"
                            required
                            error={errors.username}
                            autoComplete="username"
                            disabled={loading}
                        />                       
                        <InputField
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            error={errors.email}
                            autoComplete="email"
                            disabled={loading}
                        />                       
                        <InputField
                            type="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                            required
                            error={errors.password}
                            showTogglePassword={true}
                            autoComplete="new-password"
                            disabled={loading}
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
                            autoComplete="new-password"
                            disabled={loading}
                        />                      
                        <button 
                            type="submit" 
                            className="register-submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                        </button>
                    </form>                  
                    <button 
                        className="register-google-button" 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <img src={googleIcon} alt="Google" className="register-google-icon" />
                        Đăng nhập với Google
                    </button>
                    
                    <div className="register-login-prompt">
                        <span>Bạn đã có tài khoản? </span>
                        <Link to="/login" className="register-login-link">Đăng nhập</Link>
                    </div>
                </div>            
                <div className="register-brand-logo">
                    <div className="register-logo-wrapper">
                        <img src={logoImage} alt="Greenweave Logo" className="register-logo-image" />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Register;