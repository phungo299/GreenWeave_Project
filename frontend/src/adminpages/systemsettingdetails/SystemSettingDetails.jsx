import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import InputField from '../../components/ui/inputfield/InputField';
import './SystemSettingDetails.css';

const TYPE_OPTIONS = [
    { label: 'General', value: 'General' },
    { label: 'Security', value: 'Security' },
];

const SystemSettingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAddMode = !id || location.pathname.includes('/add');
    const [form, setForm] = useState(() => {
        // If in add new mode, return empty form
        if (isAddMode) {
            return {
                name: '',
                type: '',
                value: '',
                priority: '',
                status: 'active',
                description: '',
            };
        }
        
        // Mock data - in reality you will fetch data from API
        const MOCK_SETTINGS = [
            { id: 1, name: 'Max Login Attempts', type: 'Security', value: '5', priority: 1, status: 'active', description: 'Số lần đăng nhập tối đa trước khi khóa tài khoản' },
            { id: 2, name: 'Site Title', type: 'General', value: 'GreenWeave', priority: 2, status: 'active', description: 'Tên hiển thị trên website' },
            { id: 3, name: 'Maintenance Mode', type: 'General', value: 'Off', priority: 3, status: 'inactive', description: 'Bật/tắt chế độ bảo trì website' },
            { id: 4, name: 'Session Timeout', type: 'Security', value: '30m', priority: 4, status: 'active', description: 'Thời gian timeout của phiên đăng nhập' },
        ];
        
        // Find setting with corresponding id
        const existingSetting = MOCK_SETTINGS.find(setting => setting.id === parseInt(id)) || {
            name: '',
            type: '',
            value: '',
            priority: '',
            status: 'active',
            description: '',
        };
        
        return existingSetting;
    });

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
            status: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle data storage here
        alert(`Đã ${isAddMode ? 'thêm' : 'cập nhật'} cài đặt!`);
        navigate('/admin/settings');
    };

    const handleCancel = () => {
        navigate('/admin/settings');
    };

    return (
        <div className="admin-system-setting-details-container">
            <AdminBreadcrumb />
            <div className="admin-system-setting-details-content">
                <h1 className="admin-system-setting-details-title">
                    {isAddMode ? 'Thêm Cài Đặt' : 'Chi Tiết Cài Đặt'}
                </h1>
                <form className="admin-system-setting-details-form" onSubmit={handleSubmit}>
                    <div className="admin-system-setting-details-row">
                        <div className="admin-system-setting-details-col">
                            <InputField
                                label="Tên"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
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
                                <option value="">Chọn loại</option>
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="admin-system-setting-details-row">
                        <div className="admin-system-setting-details-col">
                            <InputField
                                label="Giá Trị"
                                name="value"
                                value={form.value}
                                onChange={handleChange}
                                required
                                className="admin-system-setting-details-input"
                                labelClassName="admin-system-setting-details-label-inline"
                            />
                        </div>
                        <div className="admin-system-setting-details-col">
                            <InputField
                                label="Độ Ưu Tiên"
                                name="priority"
                                type="number"
                                value={form.priority}
                                onChange={handleChange}
                                required
                                className="admin-system-setting-details-input"
                                labelClassName="admin-system-setting-details-label-inline"
                            />
                        </div>
                        <div className="admin-system-setting-details-col admin-system-setting-details-col-status">
                            <label className="admin-system-setting-details-label-inline" style={{marginTop: '0px'}}>Trạng Thái</label>
                            <div className="admin-system-setting-details-radio-container">
                                <div className="admin-system-setting-details-radio-item">
                                    <input
                                        type="radio"
                                        id="status-active"
                                        name="status"
                                        value="active"
                                        checked={form.status === 'active'}
                                        onChange={handleRadioChange}
                                    />
                                    <label htmlFor="status-active">Hoạt động</label>
                                </div>
                                <div className="admin-system-setting-details-radio-item">
                                    <input
                                        type="radio"
                                        id="status-inactive"
                                        name="status"
                                        value="inactive"
                                        checked={form.status === 'inactive'}
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
                        <button type="submit" className="admin-system-setting-details-save-btn">Lưu</button>
                    </div>
                </form>   
            </div>
        </div>
    );
};
export default SystemSettingDetails;