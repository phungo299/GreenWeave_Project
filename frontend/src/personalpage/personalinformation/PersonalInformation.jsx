import React, { useState, useRef } from 'react';
import { FaUser, FaUpload } from 'react-icons/fa';
import InputField from '../../components/ui/inputfield/InputField';
import './PersonalInformation.css';

const PersonalInformation = () => {
    const [formData, setFormData] = useState({
        fullName: '32405',
        email: '32405'
    });
    
    const [errors, setErrors] = useState({});
    const [avatar, setAvatar] = useState(null);
    const fileInputRef = useRef(null);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };
    
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ và tên';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            // Handle form submission logic here
            console.log('Personal information submitted:', formData);
            console.log('Avatar:', avatar);
            
            // Show success message (in a real app, this would happen after API call)
            alert('Thông tin cá nhân đã được cập nhật!');
        }
    };
    
    return (
        <div className="personal-information-container">
            <h2 className="personal-information-title">Thông tin cá nhân</h2>           
            <div className="personal-information-avatar-section">
                <label className="personal-information-avatar-label">Ảnh đại diện</label>
                <div className="personal-information-avatar-container">
                    <div className="personal-information-avatar" onClick={handleAvatarClick}>
                        {avatar ? (
                            <img 
                                src={avatar} 
                                alt="Ảnh đại diện" 
                                className="personal-information-avatar-image" 
                            />
                        ) : (
                            <FaUser className="personal-information-avatar-icon" />
                        )}
                    </div>
                    
                    <div className="personal-information-avatar-upload">
                        <button 
                            type="button" 
                            className="personal-information-upload-btn"
                            onClick={handleAvatarClick}
                        >
                            <FaUpload className="personal-information-upload-icon" />
                            Tải ảnh lên
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="personal-information-file-input"
                        />
                        <span className="personal-information-upload-hint">
                            Hỗ trợ định dạng JPG, PNG. Tối đa 2MB.
                        </span>
                    </div>
                </div>
            </div>           
            <form onSubmit={handleSubmit} className="personal-information-form">
                <div className="personal-information-field">
                    <InputField
                        label="Tên người dùng"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                        className="personal-information-input"
                        error={errors.fullName}
                    />
                </div>                
                <div className="personal-information-field">
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                        className="personal-information-input"
                        error={errors.email}
                    />
                </div>               
                <button type="submit" className="personal-information-save-btn">
                    Lưu Thay Đổi
                </button>
            </form>
        </div>
    );
};
export default PersonalInformation;