import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Register.css';
import loginBackground from '../assets/images/login.jpg';
import logoImage from '../assets/images/logo.jpg';
import googleIcon from '../assets/icons/google.png'; 
import InputField from '../components/ui/inputfield/InputField';

const Register = () => {
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

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if (validate()) {
            console.log('Register attempt with:', userData);
            // Add actual register logic here
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
        // Implement Google login logic
    };

    return (
        <div className="register-page" style={{ backgroundImage: `url(${loginBackground})` }}>
            <div className="register-container">
                <div className="register-form-box">
                    <h1 className="register-title">Tạo tài khoản</h1>
                    <p className="register-subtitle">Bắt đầu với Greenweave!</p>                                      
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
                        />                      
                        <button type="submit" className="register-submit-button">Tạo tài khoản</button>
                    </form>                  
                    <button className="register-google-button" onClick={handleGoogleLogin}>
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