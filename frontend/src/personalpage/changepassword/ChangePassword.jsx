import React, { useState } from 'react';
import InputField from '../../components/ui/inputfield/InputField';
import personalService from '../../services/personalService';
import './ChangePassword.css';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
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
        
        // Clear success message when user starts typing
        if (success) {
            setSuccess(false);
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
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
        }
        
        if (!formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (formData.confirmNewPassword !== formData.newPassword) {
            newErrors.confirmNewPassword = 'Xác nhận mật khẩu mới không khớp';
        }
        
        if (formData.currentPassword && formData.newPassword && 
            formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            setErrors({});
            
            const passwordData = {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            };
            
            await personalService.changePassword(passwordData);
            
            // Reset form after successful submission
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
            
            setSuccess(true);
            
            // Show success message for 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
            
        } catch (err) {
            console.error('Error changing password:', err);
            
            // Handle specific error cases
            if (err.status === 400) {
                setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
            } else if (err.status === 401) {
                setErrors({ general: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại' });
            } else {
                setErrors({ general: err.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại' });
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="personal-change-password-container">
            <h2 className="personal-change-password-title">Thay đổi mật khẩu</h2>
            
            {success && (
                <div className="personal-change-password-success">
                    <p className="success-message">Mật khẩu đã được thay đổi thành công!</p>
                </div>
            )}
            
            {errors.general && (
                <div className="personal-change-password-error">
                    <p className="error-message">{errors.general}</p>
                </div>
            )}
            
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
                        required
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
                        required
                    />
                    <div className="password-requirements">
                        <p>Mật khẩu phải có:</p>
                        <ul>
                            <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                                Ít nhất 6 ký tự
                            </li>
                            <li className={/(?=.*[a-z])/.test(formData.newPassword) ? 'valid' : ''}>
                                Ít nhất 1 chữ thường
                            </li>
                            <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'valid' : ''}>
                                Ít nhất 1 chữ hoa
                            </li>
                            <li className={/(?=.*\d)/.test(formData.newPassword) ? 'valid' : ''}>
                                Ít nhất 1 số
                            </li>
                        </ul>
                    </div>
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
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className={`personal-change-password-save-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Đang thay đổi...' : 'Lưu Thay Đổi'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;