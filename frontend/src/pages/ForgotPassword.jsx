import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/ForgotPassword.css';
import loginBackground from '../assets/images/login.jpg';
import InputField from '../components/ui/inputfield/InputField';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
        setError('');
    };

    const validateEmail = () => {
        if (!email) {
            setError('Vui lòng nhập email');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email không hợp lệ');
            return false;
        }
        return true;
    };

    const validateOtp = () => {
        if (!otp) {
            setError('Vui lòng nhập mã OTP');
            return false;
        } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            setError('Mã OTP không hợp lệ');
            return false;
        }
        return true;
    };

    const handleSendOtp = (e) => {
        e.preventDefault();
        if (validateEmail()) {
            // Simulating OTP sending
            console.log('Sending OTP to:', email);
            setOtpSent(true);
            setMessage('Mã OTP đã được gửi đến email của bạn');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleResendOtp = (e) => {
        e.preventDefault();
        if (validateEmail()) {
            // Simulating OTP resending
            console.log('Resending OTP to:', email);
            setMessage('Mã OTP mới đã được gửi đến email của bạn');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (validateOtp()) {
            // Simulating OTP verification
            console.log('Verifying OTP:', otp);          
            // In practice, you will send a request to verify the OTP        
            // Display success message
            setMessage('Xác thực thành công! Đang chuyển hướng...');
            
            // Redirect to reset password page after 1.5 seconds
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
            }, 1500);
        }
    };

    return (
        <div className="forgot-password-page" style={{ backgroundImage: `url(${loginBackground})` }}>
            <div className="forgot-password-container">
                <div className="forgot-password-form-box">
                    <h1 className="forgot-password-title">Quên mật khẩu</h1>
                    <p className="forgot-password-subtitle">Nhập email của bạn để lấy lại mật khẩu</p>                 
                    {message && <div className="forgot-password-message">{message}</div>}                  
                    <form className="forgot-password-form">
                        <div className="forgot-password-input-group">
                            <InputField
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Email"
                                required
                                error={error && !otpSent ? error : ''}
                                autoComplete="email"
                            />               
                            {otpSent && (
                                <button 
                                    type="button" 
                                    className="forgot-password-resend-button"
                                    onClick={handleResendOtp}
                                >
                                    Gửi lại OTP
                                </button>
                            )}
                        </div>                        
                        {!otpSent ? (
                            <button 
                                type="submit" 
                                className="forgot-password-submit-button"
                                onClick={handleSendOtp}
                            >
                                Gửi OTP
                            </button>
                        ) : (
                            <>
                                <InputField
                                    type="text"
                                    name="otp"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    placeholder="Nhập mã OTP"
                                    required
                                    error={error && otpSent ? error : ''}
                                    autoComplete="one-time-code"
                                />                               
                                <button 
                                    type="submit" 
                                    className="forgot-password-submit-button"
                                    onClick={handleVerifyOtp}
                                >
                                    Xác nhận
                                </button>
                            </>
                        )}
                    </form>                    
                    <div className="forgot-password-login-prompt">
                        <Link to="/login" className="forgot-password-login-link">Quay lại đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;
