import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Register.css';
import loginBackground from '../assets/images/login.jpg';
import logoImage from '../assets/images/logo.jpg';
import googleIcon from '../assets/icons/google.png'; 
import InputField from '../components/ui/inputfield/InputField';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    
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
        } else if (userData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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
                // TODO: Replace with actual API once API is available
                const result = await register(userData);
                if (result.success) {
                    // Redirect user to login page after successful registration
                    navigate('/login', { state: { registrationSuccess: true } });
                } else {
                    setRegisterError(result.message || 'Đăng ký không thành công');
                }
            } catch (error) {
                console.error('Register error:', error);
                setRegisterError('Đã xảy ra lỗi khi đăng ký, vui lòng thử lại sau');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
        // TODO: Implement Google login logic khi có API
    };

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