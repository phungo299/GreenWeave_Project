import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Login.css';
import loginBackground from '../assets/images/login.jpg';
import logoImage from '../assets/images/logo.jpg';
import InputField from '../components/ui/inputfield/InputField';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCredentials({
            ...credentials,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        // Remove login error message when user changes input
        if (loginError) {
            setLoginError('');
        }
    };

    const validate = () => {
        const newErrors = {};
        let isValid = true;
        if (!credentials.username) {
            newErrors.username = 'Vui lòng nhập email hoặc số điện thoại';
            isValid = false;
        }
        if (!credentials.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            isValid = false;
        } else if (credentials.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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
                const result = await login(credentials);
                if (result.success) {
                    // Redirect user after successful login
                    navigate(from, { replace: true });
                } else {
                    setLoginError(result.message || 'Đăng nhập không thành công');
                }
            } catch (error) {
                console.error('Login error:', error);
                setLoginError('Đã xảy ra lỗi khi đăng nhập, vui lòng thử lại sau');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${loginBackground})` }}>
            <div className="login-container">
                <div className="login-form-box">
                    <h1 className="login-title">Xin chào!</h1>
                    <p className="login-subtitle">Đăng nhập vào tài khoản của bạn</p>                    
                    {loginError && <div className="login-error">{loginError}</div>}                    
                    <form className="login-form" onSubmit={handleSubmit}>
                        <InputField
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="Nhập email hoặc số điện thoại"
                            required
                            error={errors.username}
                            autoComplete="username"
                            disabled={loading}
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
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
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
        </div>
    );
};
export default Login;
