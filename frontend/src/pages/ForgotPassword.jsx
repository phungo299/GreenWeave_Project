import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/ForgotPassword.css';
import ParticleBackground from '../components/common/ParticleBackground';
import RoyalButton from '../components/ui/button/RoyalButton';
import InputField from '../components/ui/inputfield/InputField';
import authService from '../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [countdown, setCountdown] = useState(0);
    
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [messages, setMessages] = useState({
        success: '',
        error: ''
    });

    // Countdown timer for resend OTP
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Real-time validation
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'email':
                if (!value) {
                    error = 'Vui lòng nhập email';
                } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    error = 'Định dạng email không hợp lệ';
                }
                break;
            case 'otp':
                if (!value) {
                    error = 'Vui lòng nhập mã OTP';
                } else if (!/^\d{6}$/.test(value)) {
                    error = 'Mã OTP phải là 6 chữ số';
                }
                break;
            case 'newPassword':
                if (!value) {
                    error = 'Vui lòng nhập mật khẩu mới';
                } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,30}$/.test(value)) {
                    error = 'Mật khẩu phải chứa chữ thường, in hoa, số, ký tự đặc biệt và từ 6 đến 30 ký tự';
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    error = 'Vui lòng xác nhận mật khẩu';
                } else if (value !== formData.newPassword) {
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
        
        // Special handling for OTP - only allow numbers and limit to 6 digits
        if (name === 'otp') {
            const numericValue = value.replace(/\D/g, '').slice(0, 6);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Real-time validation
        const error = validateField(name, name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value);
        setErrors(prev => ({ ...prev, [name]: error }));

        // Clear messages when user types
        if (messages.error || messages.success) {
            setMessages({ success: '', error: '' });
        }
    };

    const validateStep = (currentStep) => {
        let isValid = true;
        const newErrors = { ...errors };

        switch (currentStep) {
            case 1:
                newErrors.email = validateField('email', formData.email);
                if (newErrors.email) isValid = false;
                break;
            case 2:
                newErrors.otp = validateField('otp', formData.otp);
                if (newErrors.otp) isValid = false;
                break;
            case 3:
                newErrors.newPassword = validateField('newPassword', formData.newPassword);
                newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
                if (newErrors.newPassword || newErrors.confirmPassword) isValid = false;
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Step 1: Send OTP to email
    const handleSendOTP = async (e) => {
        e.preventDefault();
        
        if (!validateStep(1)) return;

        setLoading(true);
        setMessages({ success: '', error: '' });

        try {
            const response = await authService.forgotPassword(formData.email);
            
            if (response.success) {
                setStep(2);
                setCountdown(60);
                setMessages({ 
                    success: `Mã OTP đã được gửi đến email ${formData.email}. Vui lòng kiểm tra hộp thư của bạn.`,
                    error: '' 
                });
            } else {
                setMessages({ 
                    success: '', 
                    error: response.error || 'Không thể gửi mã OTP. Vui lòng thử lại.' 
                });
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            setMessages({ 
                success: '', 
                error: error.message || 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        if (!validateStep(2)) return;

        setLoading(true);
        setMessages({ success: '', error: '' });

        try {
            const response = await authService.verifyResetOTP(formData.email, formData.otp);
            
            if (response.success) {
                setStep(3);
                setMessages({ 
                    success: 'Xác thực thành công! Vui lòng nhập mật khẩu mới.',
                    error: '' 
                });
            } else {
                setMessages({ 
                    success: '', 
                    error: response.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.' 
                });
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            setMessages({ 
                success: '', 
                error: error.message || 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!validateStep(3)) return;

        setLoading(true);
        setMessages({ success: '', error: '' });

        try {
            const response = await authService.resetPassword(
                formData.email, 
                formData.otp, 
                formData.newPassword
            );
            
            if (response.success) {
                setMessages({ 
                    success: 'Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...',
                    error: '' 
                });
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' 
                        } 
                    });
                }, 2000);
            } else {
                setMessages({ 
                    success: '', 
                    error: response.error || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.' 
                });
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setMessages({ 
                success: '', 
                error: error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setLoading(true);
        setMessages({ success: '', error: '' });

        try {
            const response = await authService.forgotPassword(formData.email);
            
            if (response.success) {
                setCountdown(60);
                setMessages({ 
                    success: 'Mã OTP mới đã được gửi đến email của bạn.',
                    error: '' 
                });
            } else {
                setMessages({ 
                    success: '', 
                    error: response.error || 'Không thể gửi lại mã OTP. Vui lòng thử lại.' 
                });
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setMessages({ 
                success: '', 
                error: error.message || 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const handleBackStep = () => {
        if (step > 1) {
            setStep(step - 1);
            setMessages({ success: '', error: '' });
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Quên mật khẩu';
            case 2: return 'Xác thực OTP';
            case 3: return 'Đặt lại mật khẩu';
            default: return 'Quên mật khẩu';
        }
    };

    const getStepSubtitle = () => {
        switch (step) {
            case 1: return 'Nhập email của bạn để nhận mã xác thực';
            case 2: return `Nhập mã OTP đã được gửi đến ${formData.email}`;
            case 3: return 'Tạo mật khẩu mới cho tài khoản của bạn';
            default: return '';
        }
    };

    const getStepIcon = () => {
        switch (step) {
            case 1: return <FaEnvelope />;
            case 2: return <FaShieldAlt />;
            case 3: return <FaShieldAlt />;
            default: return <FaEnvelope />;
        }
    };

    return (
        <>
            <ParticleBackground 
                particleCount={60}
                speed={0.8}
                size={3}
                opacity={0.7}
            />
            
            <div className="forgot-password-page">
                <div className="forgot-password-container">
                    <div className="forgot-password-form-box">
                        <button 
                            className="back-button"
                            onClick={step === 1 ? handleBackToLogin : handleBackStep}
                            aria-label={step === 1 ? "Quay lại đăng nhập" : "Quay lại bước trước"}
                        >
                            <FaArrowLeft /> {step === 1 ? 'Đăng nhập' : 'Quay lại'}
                        </button>
                        
                        {/* Step indicator */}
                        <div className="step-indicator">
                            <div className="step-icon">
                                {getStepIcon()}
                            </div>
                            <div className="step-progress">
                                <div className="step-number">Bước {step}/3</div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${(step / 3) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <h1 className="forgot-password-title">{getStepTitle()}</h1>
                        <p className="forgot-password-subtitle">{getStepSubtitle()}</p>
                        
                        {messages.success && (
                            <div className="forgot-password-success" role="alert">
                                {messages.success}
                            </div>
                        )}
                        
                        {messages.error && (
                            <div className="forgot-password-error" role="alert">
                                {messages.error}
                            </div>
                        )}
                        
                        <form className="forgot-password-form" noValidate>
                            {step === 1 && (
                                <>
                                    <InputField
                                        label="Email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Nhập địa chỉ email của bạn"
                                        required
                                        error={errors.email}
                                        disabled={loading}
                                        autoComplete="email"
                                        icon={<FaEnvelope />}
                                        aria-invalid={!!errors.email}
                                    />
                                    
                                    <RoyalButton
                                        type="submit"
                                        variant="primary"
                                        size="large"
                                        fullWidth
                                        loading={loading}
                                        disabled={loading}
                                        onClick={handleSendOTP}
                                        aria-busy={loading}
                                    >
                                        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                    </RoyalButton>
                                </>
                            )}
                            
                            {step === 2 && (
                                <>
                                    <InputField
                                        label="Mã OTP"
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        placeholder="Nhập mã OTP 6 chữ số"
                                        required
                                        error={errors.otp}
                                        disabled={loading}
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                        icon={<FaShieldAlt />}
                                        aria-invalid={!!errors.otp}
                                    />
                                    
                                    <RoyalButton
                                        type="submit"
                                        variant="primary"
                                        size="large"
                                        fullWidth
                                        loading={loading}
                                        disabled={loading}
                                        onClick={handleVerifyOTP}
                                        aria-busy={loading}
                                    >
                                        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                                    </RoyalButton>
                                    
                                    <div className="resend-section">
                                        <RoyalButton
                                            variant="outline"
                                            size="medium"
                                            onClick={handleResendOTP}
                                            disabled={countdown > 0 || loading}
                                        >
                                            {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
                                        </RoyalButton>
                                        
                                        {countdown > 0 && (
                                            <p className="countdown-text">
                                                Bạn có thể yêu cầu gửi lại mã sau {countdown} giây
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                            
                            {step === 3 && (
                                <>
                                    <InputField
                                        label="Mật khẩu mới"
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu mới"
                                        required
                                        error={errors.newPassword}
                                        showTogglePassword={true}
                                        disabled={loading}
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.newPassword}
                                    />
                                    
                                    <InputField
                                        label="Xác nhận mật khẩu"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Xác nhận mật khẩu mới"
                                        required
                                        error={errors.confirmPassword}
                                        showTogglePassword={true}
                                        disabled={loading}
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.confirmPassword}
                                    />
                                    
                                    <RoyalButton
                                        type="submit"
                                        variant="success"
                                        size="large"
                                        fullWidth
                                        loading={loading}
                                        disabled={loading}
                                        onClick={handleResetPassword}
                                        aria-busy={loading}
                                    >
                                        {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                                    </RoyalButton>
                                </>
                            )}
                        </form>
                        
                        <div className="forgot-password-login-prompt">
                            <span>Nhớ mật khẩu? </span>
                            <Link to="/login" className="forgot-password-login-link">Đăng nhập ngay</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
