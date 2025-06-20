import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/ForgotVerifyEmail.css';
import loginBackground from '../assets/images/login.jpg';
import InputField from '../components/ui/inputfield/InputField';
import { useAuth } from '../context/AuthContext';

const ForgotVerifyEmail = ({ initialEmail = '', onVerificationSuccess, isModal = false }) => {
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { verifyEmail, resendVerification, checkVerificationStatus } = useAuth();

    // Update email when initialEmail changes
    useEffect(() => {
        // Only update email from prop
        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    // Add a new useEffect to automatically send OTP
    useEffect(() => {
        // Automatically send OTP if there is an initial email and OTP has not been sent
        if (initialEmail && initialEmail.trim() !== '' && !otpSent && !loading) {
            const autoSendOtp = async () => {
                if (!email || email.trim() === '') return;
                // Validate email format before sending
                if (!/\S+@\S+\.\S+/.test(email.trim())) {
                    setError('Email không hợp lệ');
                    return;
                }
                setLoading(true);
                try {
                    const result = await checkVerificationStatus(email);
                
                    if (result.isVerified) {
                        setError(result.message);
                    } else {
                        setOtpSent(true);
                        setMessage('Mã xác thực đã được gửi đến email của bạn');
                        setTimeout(() => setMessage(''), 5000);
                    }
                } catch (error) {
                    console.error('Auto send verification error:', error);
                    if (error.status === 404) {
                        setError('Không tìm thấy tài khoản với email này');
                    } else {
                        setError(error.message || 'Đã xảy ra lỗi khi gửi mã xác thực');
                    }
                } finally {
                    setLoading(false);
                }
            };
            autoSendOtp();
        }
    }, [initialEmail, otpSent, loading, email, checkVerificationStatus]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
        setError('');
    };
    
    const validateEmail = () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError('Vui lòng nhập email');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            setError('Email không hợp lệ');
            return false;
        }
        return true;
    };

    const validateOtp = () => {
        if (!otp) {
            setError('Vui lòng nhập mã xác thực');
            return false;
        } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            setError('Mã xác thực không hợp lệ');
            return false;
        }
        return true;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (validateEmail()) {
            setLoading(true);
            try {
                const result = await checkVerificationStatus(email.trim());
                
                if (result.isVerified) {
                    // If email is already verified
                    setError(result.message);
                } else {
                    // If email is not verified and OTP code has been sent
                    setOtpSent(true);
                    setMessage('Mã xác thực đã được gửi đến email của bạn');
                    setTimeout(() => setMessage(''), 5000);
                }
            } catch (error) {
                console.error('Send verification error:', error);
                if (error.status === 404) {
                    setError('Không tìm thấy tài khoản với email này');
                } else {
                    setError(error.message || 'Đã xảy ra lỗi khi gửi mã xác thực');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResendOtp = async (e) => {
        e.preventDefault();
        if (validateEmail()) {
            setLoading(true);
            try {
                const result = await resendVerification(email);
                if (result.success) {
                    setMessage('Mã xác thực mới đã được gửi đến email của bạn');
                    setTimeout(() => setMessage(''), 5000);
                } else {
                    setError(result.message || 'Không thể gửi lại mã xác thực');
                }
            } catch (error) {
                console.error('Resend verification error:', error);
                setError(error.message || 'Đã xảy ra lỗi khi gửi lại mã xác thực');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (validateOtp()) {
            setLoading(true);
            try {
                const result = await verifyEmail(otp);
                if (result.success) {
                    setMessage('Xác thực thành công! Đang chuyển hướng...');
                    // If it is modal, call callback successfully
                    if (isModal && onVerificationSuccess) {
                        setTimeout(() => {
                            onVerificationSuccess();
                        }, 1500);
                    } else {
                        // If it is a private page, redirect to the login page
                        setTimeout(() => {
                            navigate('/login', { state: { verificationSuccess: true } });
                        }, 1500);
                    }
                } else {
                    setError(result.message || 'Xác thực không thành công');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setError(error.message || 'Đã xảy ra lỗi khi xác thực');
            } finally {
                setLoading(false);
            }
        }
    };

    // Container class based on display mode (modal or full page)
    const containerClass = isModal 
        ? "forgot-email-container forgot-email-container-modal" 
        : "forgot-email-container";

    // If it is modal, do not show background
    const containerStyle = isModal 
        ? {} 
        : { backgroundImage: `url(${loginBackground})` };

    return (
        <div className={isModal ? "" : "forgot-email-page"} style={containerStyle}>
            <div className={containerClass}>
                <div className="forgot-email-form-box">
                    <h1 className="forgot-email-title">Xác thực tài khoản</h1>
                    <p className="forgot-email-subtitle">Nhập email đã đăng ký để nhận mã xác thực</p>                 
                    {message && <div className="forgot-email-message">{message}</div>}
                    {error && <div className="forgot-email-error">{error}</div>}                  
                    <form className="forgot-email-form">
                        <div className="forgot-email-input-group">
                            <InputField
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Email"
                                required
                                error=""
                                autoComplete="email"
                                disabled={loading}
                            />               
                            {otpSent && (
                                <button 
                                    type="button" 
                                    className="forgot-email-resend-button"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                >
                                    Gửi lại mã
                                </button>
                            )}
                        </div>                        
                        {!otpSent ? (
                            <button 
                                type="submit" 
                                className="forgot-email-submit-button"
                                onClick={handleSendOtp}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Gửi mã xác thực'}
                            </button>
                        ) : (
                            <>
                                <InputField
                                    type="text"
                                    name="otp"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    placeholder="Nhập mã xác thực"
                                    required
                                    error=""
                                    autoComplete="one-time-code"
                                    disabled={loading}
                                    maxLength={6}
                                />                               
                                <button 
                                    type="submit" 
                                    className="forgot-email-submit-button"
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                            </>
                        )}
                    </form>                    
                    {!isModal && (
                        <div className="forgot-email-login-prompt">
                            <Link to="/login" className="forgot-email-login-link">Quay lại đăng nhập</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ForgotVerifyEmail;