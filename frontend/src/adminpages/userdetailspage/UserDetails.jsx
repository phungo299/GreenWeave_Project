import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import InputField from '../../components/ui/inputfield/InputField';
import userService from '../../services/userService';
import './UserDetails.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaIdCard, FaUserTag, FaToggleOn, FaToggleOff, FaSave, FaArrowLeft } from 'react-icons/fa';

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAddMode = location.pathname.includes('/add');
    const isViewOnly = !isAddMode && location.pathname.includes('/detail');
    
    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        address: '',
        avatar: '',
        fullName: '',
        isDisabled: false
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const response = await userService.getById(userId);
                //console.log('User details response:', response);            
                if (response && response.data) {
                    // Ensure proper formatting of address if it's a string that contains JSON
                    let userData = {...response.data};                    
                    if (typeof userData.address === 'string' && userData.address.startsWith('{')) {
                        try {
                            userData.address = JSON.parse(userData.address);
                        } catch (e) {
                            console.error('Error parsing address JSON:', e);
                        }
                    }               
                    setUser(userData);
                } else {
                    setError('Không thể tải thông tin người dùng');
                }
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Đã xảy ra lỗi khi tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };        
        if (!isAddMode && userId) {
            fetchUserDetails();
        }
    }, [userId, isAddMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));     
        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleToggleStatus = () => {
        if (isViewOnly && user.role === 'admin') return;        
        setUser(prev => ({
            ...prev,
            isDisabled: !prev.isDisabled
        }));
    };

    const validateForm = () => {
        const errors = {};       
        if (!user.username) {
            errors.username = 'Tên đăng nhập là bắt buộc';
        } else if (user.username.length < 8) {
            errors.username = 'Tên đăng nhập phải có ít nhất 8 ký tự';
        }       
        if (!user.email) {
            errors.email = 'Email là bắt buộc';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(user.email)) {
            errors.email = 'Email không hợp lệ';
        }       
        if (isAddMode && user.password && user.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }        
        if (!user.role) {
            errors.role = 'Vai trò là bắt buộc';
        }        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }        
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);        
        try {
            // Create a copy of the user data for submission
            const userData = {...user};           
            // Format address if it's a string representation of an object
            if (typeof userData.address === 'string' && userData.address.startsWith('{')) {
                try {
                    userData.address = JSON.parse(userData.address);
                } catch (e) {
                    console.error('Error parsing address JSON:', e);
                    // Keep as string if parsing fails
                }
            }            
            let response;           
            if (isAddMode) {
                //console.log('Creating new user with data:', userData);
                response = await userService.create(userData);               
                // Check if response contains a generated password
                if (response && response.message && response.message.includes("Mật khẩu mặc định")) {
                    // Extract and display the default password
                    setSuccess(response.message);
                } else {
                    setSuccess("Tạo tài khoản thành công!");
                }               
                // Reset form after successful creation
                setUser({
                    username: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'user',
                    address: '',
                    avatar: '',
                    fullName: '',
                    isDisabled: false
                });
            } else {
                //console.log('Updating user with data:', userData);
                response = await userService.update(userId, userData);
                setSuccess("Cập nhật thông tin thành công!");
            }           
            // Show success message temporarily
            setTimeout(() => {
                if (isAddMode) {
                    navigate('/admin/users');
                }
            }, 10000); // Increased time to allow reading the generated password
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/users');
    };

    if (loading) {
        return <div className="admin-user-details-loading">Đang tải thông tin...</div>;
    }

    const pageTitle = isAddMode ? 'Thêm người dùng mới' : isViewOnly ? 'Chi tiết người dùng' : 'Chỉnh sửa người dùng';

    return (
        <div className="admin-user-details-container">
            <AdminBreadcrumb />
            <div className="admin-user-details-content">
                <div className="admin-user-details-header">
                    <button 
                        className="admin-user-details-back-btn" 
                        onClick={handleBack}
                        aria-label="Quay lại"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="admin-user-details-title">{pageTitle}</h1>
                </div>
                {error && <div className="admin-user-details-error">{error}</div>}
                {success && <div className="admin-user-details-success">{success}</div>}
                <form className="admin-user-details-form" onSubmit={handleSubmit}>
                    <div className="admin-user-details-rows">
                        <div className="admin-user-details-row">
                            <div className="admin-user-details-field">
                                <InputField
                                    label="Tên đăng nhập"
                                    name="username"
                                    value={user.username}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                    icon={<FaUser />}
                                    error={formErrors.username}
                                    disabled={isViewOnly}
                                />
                            </div>
                            <div className="admin-user-details-field">
                                <InputField
                                    label="Số điện thoại"
                                    name="phone"
                                    value={user.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                    icon={<FaPhone />}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className="admin-user-details-row">
                            <div className="admin-user-details-field">
                                <InputField
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleInputChange}
                                    placeholder="Nhập email"
                                    required
                                    icon={<FaEnvelope />}
                                    error={formErrors.email}
                                    disabled={isViewOnly}
                                />
                            </div>
                            <div className="admin-user-details-field">
                                <InputField
                                    label="Địa chỉ"
                                    name="address"
                                    value={typeof user.address === 'string' ? user.address : JSON.stringify(user.address)}
                                    onChange={handleInputChange}
                                    placeholder="Nhập địa chỉ"
                                    icon={<FaMapMarkerAlt />}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                        <div className="admin-user-details-row">
                            <div className="admin-user-details-field">
                                {isAddMode ? (
                                    <InputField
                                        label="Mật khẩu"
                                        type="password"
                                        name="password"
                                        value={user.password}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mật khẩu hoặc để trống để tạo tự động"
                                        icon={<FaLock />}
                                        error={formErrors.password}
                                        showTogglePassword
                                    />
                                ) : (
                                    <InputField
                                        label="Họ và tên"
                                        name="fullName"
                                        value={user.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ và tên"
                                        icon={<FaIdCard />}
                                        disabled={isViewOnly}
                                    />
                                )}
                            </div>
                            <div className="admin-user-details-field">
                                {isAddMode ? (
                                    <InputField
                                        label="Họ và tên"
                                        name="fullName"
                                        value={user.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ và tên"
                                        icon={<FaIdCard />}
                                        disabled={isViewOnly}
                                    />
                                ) : (
                                    <div className="admin-user-details-select-group">
                                        <label className="admin-user-details-label">
                                            Vai trò
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="admin-user-details-select-wrapper">
                                            <FaUserTag className="admin-user-details-select-icon" />
                                            <select
                                                name="role"
                                                value={user.role}
                                                onChange={handleInputChange}
                                                className="admin-user-details-select"
                                                required
                                                disabled={isViewOnly || (user.role === 'admin')}
                                            >
                                                <option value="user">User</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        {formErrors.role && <div className="admin-user-details-error-message">{formErrors.role}</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="admin-user-details-row">
                            <div className="admin-user-details-field">
                                {isAddMode ? (
                                    <div className="admin-user-details-select-group">
                                        <label className="admin-user-details-label">
                                            Vai trò
                                            <span className="required-asterisk">*</span>
                                        </label>
                                        <div className="admin-user-details-select-wrapper">
                                            <FaUserTag className="admin-user-details-select-icon" />
                                            <select
                                                name="role"
                                                value={user.role}
                                                onChange={handleInputChange}
                                                className="admin-user-details-select"
                                                required
                                                disabled={isViewOnly || (user.role === 'admin')}
                                            >
                                                <option value="user">User</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        {formErrors.role && <div className="admin-user-details-error-message">{formErrors.role}</div>}
                                    </div>
                                ) : (
                                    <div style={{ visibility: 'hidden' }} className="admin-user-details-field-placeholder"></div>
                                )}
                            </div>
                            <div className="admin-user-details-field">
                                <div className="admin-user-details-toggle-group">
                                    <label className="admin-user-details-label">Trạng thái</label>
                                    <button 
                                        type="button"
                                        className={`admin-user-details-toggle-btn ${user.isDisabled ? 'disabled' : 'active'} ${(isViewOnly && user.role === 'admin') ? 'no-click' : ''}`}
                                        onClick={handleToggleStatus}
                                        disabled={isViewOnly && user.role === 'admin'}
                                    >
                                        {user.isDisabled ? (
                                            <>
                                                <FaToggleOff className="admin-user-details-toggle-icon" />
                                                <span>Vô hiệu hóa</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaToggleOn className="admin-user-details-toggle-icon" />
                                                <span>Đang hoạt động</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {!isViewOnly && (
                        <div className="admin-user-details-actions">
                            <button 
                                type="button" 
                                className="admin-user-details-cancel-btn"
                                onClick={handleBack}
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit" 
                                className="admin-user-details-save-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang lưu...' : (
                                    <>
                                        <FaSave className="admin-user-details-save-icon" />
                                        Lưu thông tin
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
export default UserDetails;