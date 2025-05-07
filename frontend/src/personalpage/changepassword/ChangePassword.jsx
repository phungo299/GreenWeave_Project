import React, { useState } from 'react';
import InputField from '../../components/ui/inputfield/InputField';
import './ChangePassword.css';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        confirmCurrentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    
    const [errors, setErrors] = useState({});
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }
        
        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        if (!formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (formData.confirmNewPassword !== formData.newPassword) {
            newErrors.confirmNewPassword = 'Xác nhận mật khẩu mới không khớp';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();       
        if (validateForm()) {
            // Handle password change logic here
            console.log('Password change submitted:', formData);           
            // Reset form after successful submission
            setFormData({
                currentPassword: '',
                confirmCurrentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });           
            // Show success message (in a real app, this would happen after API call)
            alert('Mật khẩu đã được thay đổi thành công!');
        }
    };
    
    return (
        <div className="personal-change-password-container">
            <h2 className="personal-change-password-title">Thay đổi mật khẩu</h2>            
            <form onSubmit={handleSubmit} className="personal-change-password-form">
                <div className="personal-change-password-field">
                    <InputField
                        label="Mật khẩu hiện tại"
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="personal-change-password-input"
                        error={errors.currentPassword}
                        showTogglePassword={true}
                    />
                </div>                
                <div className="personal-change-password-field">
                    <InputField
                        label="Mật khẩu mới"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu mới"
                        className="personal-change-password-input"
                        error={errors.newPassword}
                        showTogglePassword={true}
                    />
                </div>                
                <div className="personal-change-password-field">
                    <InputField
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleInputChange}
                        placeholder="Xác nhận mật khẩu mới"
                        className="personal-change-password-input"
                        error={errors.confirmNewPassword}
                        showTogglePassword={true}
                    />
                </div>             
                <button type="submit" className="personal-change-password-save-btn">
                    Lưu Thay Đổi
                </button>
            </form>
        </div>
    );
};
export default ChangePassword;