import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaUpload, FaEdit, FaTimes } from 'react-icons/fa';
import InputField from '../../components/ui/inputfield/InputField';
import personalService from '../../services/personalService';
import cloudinaryService from '../../services/cloudinaryService';
import './PersonalInformation.css';

const PersonalInformation = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        rewardPoints: 0
    });
    
    const [errors, setErrors] = useState({});
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Lấy thông tin profile khi component mount
    useEffect(() => {
        let isMounted = true; // Flag để kiểm tra component còn mounted không
        
        const fetchProfile = async () => {
            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }
                
                const response = await personalService.getProfile();
                
                if (response && response.data && isMounted) {
                    const userData = response.data;
                    setFormData({
                        username: userData.username || '',
                        email: userData.email || '',
                        fullName: userData.fullName || '',
                        phone: userData.phone || '',
                        rewardPoints: userData.rewardPoints || 0
                    });
                    
                    if (userData.avatar) {
                        // Handle different avatar types
                        if (typeof userData.avatar === 'string') {
                            if (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:')) {
                                // Direct URL or base64
                                setAvatar(userData.avatar);
                            } else {
                                // Cloudinary public_id or local storage key
                                const transformedUrl = cloudinaryService.getTransformedUrl(userData.avatar, {
                                    width: 200,
                                    height: 200,
                                    crop: 'fill',
                                    quality: 'auto',
                                    format: 'webp'
                                });
                                setAvatar(transformedUrl);
                            }
                        } else {
                            setAvatar(userData.avatar);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                if (isMounted) {
                    const errorMessage = err.message || 'Không thể tải thông tin cá nhân';
                    setError(errorMessage);
                    // window.toast?.error(errorMessage);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Ngăn chỉnh sửa khi chưa bật chế độ chỉnh sửa
        if (!isEditing) return;
        
        // Không cho phép thay đổi username và email
        if (name === 'username' || name === 'email') {
            return;
        }
        
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
    
    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];         
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                window.toast?.error('Kích thước file không được vượt quá 5MB');
                return;
            }            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                window.toast?.error('Vui lòng chọn file hình ảnh');
                return;
            }
            
            // Show preview immediately
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
            
            // Upload to Cloudinary
            try {
                setUploadingAvatar(true);
                setError(null);
                
                const response = await cloudinaryService.uploadAvatar(file);
                
                if (response && response.data) {
                    // Update avatar with Cloudinary URL
                    const cloudinaryUrl = cloudinaryService.getTransformedUrl(response.data.public_id, {
                        width: 200,
                        height: 200,
                        crop: 'fill',
                        quality: 'auto',
                        format: 'webp'
                    });
                    
                    setAvatar(cloudinaryUrl);
                    
                    // Update user profile with new avatar
                    const updateData = {
                        avatar: response.data.public_id // Store public_id, not URL
                    };
                    
                    await personalService.updateProfile(updateData);
                    
                    // Update localStorage
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = { ...currentUser, avatar: response.data.public_id };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    window.toast?.success('Avatar đã được cập nhật thành công!');
                }
            } catch (err) {
                console.error('Error uploading avatar:', err);
                const errorMessage = err.message || 'Không thể tải lên avatar';
                setError(errorMessage);
                window.toast?.error(errorMessage);
                // Revert to previous avatar if upload fails
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                if (userData.avatar) {
                    if (typeof userData.avatar === 'string') {
                        if (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:')) {
                            // Direct URL or base64
                            setAvatar(userData.avatar);
                        } else {
                            // Cloudinary public_id or local storage key
                            const transformedUrl = cloudinaryService.getTransformedUrl(userData.avatar, {
                                width: 200,
                                height: 200,
                                crop: 'fill',
                                quality: 'auto',
                                format: 'webp'
                            });
                            setAvatar(transformedUrl);
                        }
                    } else {
                        setAvatar(userData.avatar);
                    }
                } else {
                    setAvatar(null);
                }
            } finally {
                setUploadingAvatar(false);
            }
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        // Validate họ và tên
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ và tên';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
        } else if (formData.fullName.trim().length > 50) {
            newErrors.fullName = 'Họ và tên không được quá 50 ký tự';
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName.trim())) {
            newErrors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
        }
        
        // Validate số điện thoại
        if (formData.phone) {
            const phoneNumber = formData.phone.trim().replace(/\s+/g, '');
            if (!/^[0-9]{10}$/.test(phoneNumber)) {
                newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số';
            } else if (!phoneNumber.startsWith('0')) {
                newErrors.phone = 'Số điện thoại phải bắt đầu bằng số 0';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        let isMounted = true; // Flag để kiểm tra component còn mounted không
        
        try {
            setSaving(true);
            setError(null);
            
            // Prepare data for API (chỉ gửi các trường có thể thay đổi)
            const updateData = {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim()
            };
            
            // If avatar is a file (starts with blob:), we would need to upload it
            // For now, we'll just send the profile data
            const response = await personalService.updateProfile(updateData);
            
            if (response && isMounted) {
                // Update localStorage with new user data
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, ...updateData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                window.toast?.success('Thông tin cá nhân đã được cập nhật thành công!');
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            if (isMounted) {
                const errorMessage = err.message || 'Không thể cập nhật thông tin cá nhân';
                setError(errorMessage);
                window.toast?.error(errorMessage);
            }
        } finally {
            if (isMounted) {
                setSaving(false);
            }
        }
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to original values
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData(prev => ({
            ...prev,
            fullName: userData.fullName || '',
            phone: userData.phone || ''
        }));
        setErrors({});
    };
    
    // Render loading state
    if (loading) {
        return (
            <div className="personal-information-container">
                <h2 className="personal-information-title">Thông tin cá nhân</h2>
                <div className="personal-information-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin cá nhân...</p>
                </div>
            </div>
        );
    }
    
    // Render error state
    if (error && !formData.username) {
        return (
            <div className="personal-information-container">
                <h2 className="personal-information-title">Thông tin cá nhân</h2>
                <div className="personal-information-error">
                    <p className="error-message">{error}</p>
                    <button 
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="personal-information-container">
            <h2 className="personal-information-title">Thông tin cá nhân</h2>
            

            
            <div className="personal-information-avatar-section">
                <label className="personal-information-avatar-label">Ảnh đại diện</label>
                <div className="personal-information-avatar-container">
                    <div className="personal-information-avatar" onClick={handleAvatarClick}>
                        {uploadingAvatar ? (
                            <div className="personal-information-avatar-uploading">
                                <div className="loading-spinner"></div>
                                <span>Đang tải lên...</span>
                            </div>
                        ) : avatar ? (
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
                            className={`personal-information-upload-btn ${uploadingAvatar ? 'loading' : ''}`}
                            onClick={handleAvatarClick}
                            disabled={uploadingAvatar}
                        >
                            <FaUpload className="personal-information-upload-icon" />
                            {uploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh lên'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="personal-information-file-input"
                            disabled={uploadingAvatar}
                        />
                        <span className="personal-information-upload-hint">
                            Hỗ trợ định dạng JPG, PNG, GIF, WEBP. Tối đa 5MB.
                        </span>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="personal-information-form">
                <div className="personal-information-field">
                    <InputField
                        label="Tên người dùng"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Tên người dùng"
                        className="personal-information-input readonly"
                        disabled={true}
                        readOnly={true}
                    />
                    <span className="personal-information-readonly-note">
                        Tên người dùng không thể thay đổi
                    </span>
                </div>
                
                <div className="personal-information-field">
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="personal-information-input readonly"
                        disabled={true}
                        readOnly={true}
                    />
                    <span className="personal-information-readonly-note">
                        Email không thể thay đổi
                    </span>
                </div>
                
                <div className="personal-information-field">
                    <InputField
                        label="Họ và tên"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="personal-information-input"
                        error={errors.fullName}
                        required
                        disabled={!isEditing}
                    />
                </div>
                
                <div className="personal-information-field">
                    <InputField
                        label="Số điện thoại"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                        className="personal-information-input"
                        error={errors.phone}
                        disabled={!isEditing}
                    />
                </div>
                
                <div className="personal-information-field">
                    <div className="personal-information-reward-points">
                        <label className="personal-information-label">Điểm thưởng</label>
                        <div className="personal-information-points-display">
                            <span className="points-value">{formData.rewardPoints.toLocaleString()}</span>
                            <span className="points-unit">điểm</span>
                        </div>
                        <span className="personal-information-readonly-note">
                            Điểm thưởng được tích lũy từ các đơn hàng
                        </span>
                    </div>
                </div>
                
                <div className="personal-information-button-container">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                className="personal-information-cancel-btn"
                                onClick={handleCancelEdit}
                                disabled={saving || uploadingAvatar}
                            >
                                <FaTimes />
                                Hủy
                            </button>
                            <button 
                                type="submit" 
                                className={`personal-information-save-btn ${saving ? 'loading' : ''}`}
                                disabled={saving || uploadingAvatar}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="personal-information-edit-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <FaEdit />
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default PersonalInformation;