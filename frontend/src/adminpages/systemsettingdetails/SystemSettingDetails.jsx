import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import InputField from '../../components/ui/inputfield/InputField';
import './SystemSettingDetails.css';
import settingService from '../../services/settingService';

const TYPE_OPTIONS = [
    { label: 'string', value: 'string' },
    { label: 'number', value: 'number' },
    { label: 'boolean', value: 'boolean' },
    { label: 'object', value: 'object' },
    { label: 'array', value: 'array' },
];

const SystemSettingDetails = () => {
    const { id: key } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAddMode = !key || location.pathname.includes('/add');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    
    const [form, setForm] = useState({
        key: '',
        value: '',
        type: 'string',
        description: '',
        category: 'general',
        isPublic: true,
    });

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await settingService.getSettingCategories();
                setCategories(response.categories || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setError('Không thể tải danh mục cài đặt');
            }
        };

        fetchCategories();
    }, []);

    // Fetch setting details if in edit mode
    useEffect(() => {
        if (!isAddMode) {
            const fetchSettingDetails = async () => {
                setLoading(true);
                try {
                    const setting = await settingService.getSettingByKey(key);
                    setForm({
                        key: setting.key,
                        value: setting.value,
                        type: setting.type,
                        description: setting.description,
                        category: setting.category,
                        isPublic: setting.isPublic,
                    });
                } catch (error) {
                    console.error('Failed to fetch setting details:', error);
                    setError('Không thể tải thông tin cài đặt');
                } finally {
                    setLoading(false);
                }
            };

            fetchSettingDetails();
        }
    }, [isAddMode, key]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRadioChange = (e) => {
        setForm(prev => ({
            ...prev,
            isPublic: e.target.value === 'true',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Convert value based on type
            let processedValue = form.value;
            if (form.type === 'number') {
                processedValue = Number(form.value);
            } else if (form.type === 'boolean') {
                processedValue = form.value === 'true';
            } else if (form.type === 'object' || form.type === 'array') {
                try {
                    processedValue = JSON.parse(form.value);
                } catch (error) {
                    setError('Giá trị không phải là JSON hợp lệ cho kiểu ' + form.type);
                    setLoading(false);
                    return;
                }
            }
            
            const settingData = {
                ...form,
                value: processedValue
            };
            
            if (isAddMode) {
                await settingService.createSetting(settingData);
            } else {
                await settingService.updateSetting(key, settingData);
            }
            
            navigate('/admin/settings');
        } catch (error) {
            console.error('Failed to save setting:', error);
            setError(`Không thể ${isAddMode ? 'tạo' : 'cập nhật'} cài đặt`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/settings');
    };

    if (loading && isAddMode === false) {
        return <div className="admin-loading">Đang tải...</div>;
    }

    return (
        <div className="admin-system-setting-details-container">
            <AdminBreadcrumb />
            <div className="admin-system-setting-details-content">
                <h1 className="admin-system-setting-details-title">
                    {isAddMode ? 'Thêm Cài Đặt' : 'Chi Tiết Cài Đặt'}
                </h1>
                {error && <div className="admin-system-setting-details-error">{error}</div>}
                <form className="admin-system-setting-details-form" onSubmit={handleSubmit}>
                    <div className="admin-system-setting-details-row">
                        <div className="admin-system-setting-details-col">
                            <InputField
                                label="Key"
                                name="key"
                                value={form.key}
                                onChange={handleChange}
                                required
                                disabled={!isAddMode}
                                className="admin-system-setting-details-input"
                                labelClassName="admin-system-setting-details-label-inline"
                            />
                        </div>
                        <div className="admin-system-setting-details-col admin-system-setting-details-col-type">
                            <label className="admin-system-setting-details-label-inline" style={{marginTop: '0px'}}>Loại</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                required
                                className="admin-system-setting-details-select"
                            >
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="admin-system-setting-details-row">
                        <div className="admin-system-setting-details-col">
                            {form.type === 'boolean' ? (
                                <div className="admin-system-setting-details-field">
                                    <label className="admin-system-setting-details-label-inline">Giá Trị</label>
                                    <select
                                        name="value"
                                        value={form.value}
                                        onChange={handleChange}
                                        required
                                        className="admin-system-setting-details-select"
                                    >
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </div>
                            ) : (
                                <InputField
                                    label="Giá Trị"
                                    name="value"
                                    value={form.value}
                                    onChange={handleChange}
                                    required
                                    className="admin-system-setting-details-input"
                                    labelClassName="admin-system-setting-details-label-inline"
                                />
                            )}
                        </div>
                        <div className="admin-system-setting-details-col">
                            <label className="admin-system-setting-details-label-inline" style={{marginTop: '0px'}}>Danh mục</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                                className="admin-system-setting-details-select"
                            >
                                {categories.length > 0 ? (
                                    categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))
                                ) : (
                                    <option value="general">general</option>
                                )}
                            </select>
                        </div>
                        <div className="admin-system-setting-details-col admin-system-setting-details-col-status">
                            <label className="admin-system-setting-details-label-inline" style={{marginTop: '0px'}}>Trạng Thái</label>
                            <div className="admin-system-setting-details-radio-container">
                                <div className="admin-system-setting-details-radio-item">
                                    <input
                                        type="radio"
                                        id="status-active"
                                        name="isPublic"
                                        value="true"
                                        checked={form.isPublic === true}
                                        onChange={handleRadioChange}
                                    />
                                    <label htmlFor="status-active">Hoạt động</label>
                                </div>
                                <div className="admin-system-setting-details-radio-item">
                                    <input
                                        type="radio"
                                        id="status-inactive"
                                        name="isPublic"
                                        value="false"
                                        checked={form.isPublic === false}
                                        onChange={handleRadioChange}
                                    />
                                    <label htmlFor="status-inactive">Không hoạt động</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="admin-system-setting-details-field">
                        <label className="admin-system-setting-details-label-inline" style={{height: '22px'}}>Mô tả</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="admin-system-setting-details-textarea"
                            rows={3}
                        />
                    </div>
                    <div className="admin-system-setting-details-actions">
                        <button type="button" className="admin-system-setting-details-cancel-btn" onClick={handleCancel}>Hủy</button>
                        <button 
                            type="submit" 
                            className="admin-system-setting-details-save-btn"
                            disabled={loading}
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>   
            </div>
        </div>
    );
};
export default SystemSettingDetails;