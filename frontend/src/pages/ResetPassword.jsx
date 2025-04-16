import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../assets/css/ResetPassword.css';
import loginBackground from '../assets/images/login.jpg';
import InputField from '../components/ui/inputfield/InputField';

const ResetPassword = () => {
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: ''
    });
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Assumption: Email and OTP are fetched from query params or from route state
    // In practice, these information can be passed through state when redirecting from ForgotPassword
    const email = new URLSearchParams(location.search).get('email') || '';
    const otp = new URLSearchParams(location.search).get('otp') || '';

    useEffect(() => {
        // Check if there is email and OTP
        if (!email || !otp) {
            setServerError('Không thể xác minh danh tính của bạn. Vui lòng thử lại từ đầu.');
        }
    }, [email, otp]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
        // Clear errors when user re-enters
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }    
        // Clear server error when user changes input
        if (serverError) {
            setServerError('');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        // Check password
        if (!passwordData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu mới';
            isValid = false;
        } else if (passwordData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }
        // Check password confirmation
        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            isValid = false;
        } else if (passwordData.confirmPassword !== passwordData.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            // Here will call API to reset password
            // Simulating successful password reset
            console.log('Reset password for:', email, 'with new password:', passwordData.password);
            
            // Show success message and redirect after 2 seconds
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            setServerError(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="reset-password-page" style={{ backgroundImage: `url(${loginBackground})` }}>
            <div className="reset-password-container">
                <div className="reset-password-form-box">
                    <h1 className="reset-password-title">Đặt lại mật khẩu</h1>
                    <p className="reset-password-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>
                    {serverError && (
                        <div className="reset-password-server-error">
                            {serverError}
                        </div>
                    )}                   
                    {success && (
                        <div className="reset-password-success-message">
                            Đổi mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...
                        </div>
                    )}                   
                    <form className="reset-password-form" onSubmit={handleSubmit}>
                        <InputField
                            type="password"
                            name="password"
                            value={passwordData.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu mới"
                            required
                            error={errors.password}
                            showTogglePassword={true}
                            autoComplete="new-password"
                        />                       
                        <InputField
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Xác nhận mật khẩu"
                            required
                            error={errors.confirmPassword}
                            showTogglePassword={true}
                            autoComplete="new-password"
                        />                      
                        <button 
                            type="submit" 
                            className="reset-password-submit-button"
                            disabled={success}
                        >
                            Đổi mật khẩu
                        </button>
                    </form>                    
                    <div className="reset-password-login-prompt">
                        <Link to="/login" className="reset-password-login-link">Quay lại đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ResetPassword;