import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import { FaEdit, FaTrashAlt, FaPlus, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './SystemSettingList.css';
import settingService from '../../services/settingService';

const Alert = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);
    return (
        <div className={`alert alert-${type}`}>
            <div className="alert-icon">
                <FaCheckCircle />
            </div>
            <div className="alert-message">{message}</div>
        </div>
    );
};

const STATUS_MAP = {
    true: { label: 'Hoạt động', className: 'active' },
    false: { label: 'Không hoạt động', className: 'inactive' },
};

const PAGE_SIZE = 10;

const SystemSettingList = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({
        category: '',
        isPublic: '',
    });
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        settingKey: null,
        settingName: ''
    });
    const [alert, setAlert] = useState({
        visible: false,
        message: '',
        type: 'success'
    });
    const shouldRefresh = useRef(false); // Control auto refresh

    // Fetch categories for filter
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

    // Generate category options for filter
    const categoryOptions = [
        { label: 'Tất cả', value: '' },
        ...categories.map(category => ({ label: category, value: category }))
    ];

    const statusOptions = [
        { label: 'Tất cả', value: '' },
        { label: 'Hoạt động', value: 'true' },
        { label: 'Không hoạt động', value: 'false' },
    ];

    const filterConfig = [
        {
            label: 'Danh mục',
            field: 'category',
            options: categoryOptions,
        },
        {
            label: 'Trạng Thái',
            field: 'isPublic',
            options: statusOptions,
        },
    ];

    // Fetch settings
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: PAGE_SIZE,
                sortBy: sortField,
                sortOrder: sortOrder,
            };                
            if (filterValues.category) {
                params.category = filterValues.category;
            }               
            const response = await settingService.getAllSettings(params);
            setSettings(response.settings || []);
            setTotalCount(response.pagination?.total || 0);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setError('Không thể tải dữ liệu cài đặt');
        } finally {
            setLoading(false);
        }
    }, [page, filterValues.category, sortField, sortOrder]);

    // Effect để fetch settings khi các dependency thay đổi
    useEffect(() => {
        fetchSettings();
    }, [page, filterValues.category, sortField, sortOrder, fetchSettings]);

    // Effect để refresh sau khi xóa
    useEffect(() => {
        if (shouldRefresh.current) {
            fetchSettings();
            shouldRefresh.current = false;
        }
    }, [fetchSettings]);

    const handleFilterChange = (field, value) => {
        setFilterValues(prev => ({
            ...prev,
            [field]: value,
        }));
        setPage(1);
    };

    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'asc';
        setSortField(field);
        setSortOrder(nextOrder);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleDeleteSetting = async () => {
        try {
            await settingService.deleteSetting(deleteModal.settingKey);
            handleCloseModal();
            setAlert({
                visible: true,
                message: `Đã xóa cài đặt "${deleteModal.settingName}" thành công!`,
                type: 'success'
            });
            // Reload the list
            shouldRefresh.current = true;
            fetchSettings();
        } catch (error) {
            console.error('Failed to delete setting:', error);
            setError('Không thể xóa cài đặt');
            setAlert({
                visible: true,
                message: 'Không thể xóa cài đặt. Vui lòng thử lại sau.',
                type: 'error'
            });
        }
    };

    const showDeleteConfirm = (key, name) => {
        setDeleteModal({
            visible: true,
            settingKey: key,
            settingName: name
        });
    };

    const handleCloseModal = () => {
        setDeleteModal({
            visible: false,
            settingKey: null,
            settingName: ''
        });
    };

    const handleCloseAlert = () => {
        setAlert({
            ...alert,
            visible: false
        });
    };

    // Filter by search term locally
    const filteredSettings = settings.filter(setting => {
        if (!search) return true;
        return (
            setting.key.toLowerCase().includes(search.toLowerCase()) ||
            setting.description.toLowerCase().includes(search.toLowerCase()) ||
            String(setting.value).toLowerCase().includes(search.toLowerCase())
        );
    });

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (loading && settings.length === 0) {
        return <div className="admin-loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="admin-error">{error}</div>;
    }

    return (
        <div className="admin-system-setting-container">
            <AdminBreadcrumb />
            <div className="admin-system-setting-content">
                <div className="admin-system-setting-header-row">
                    <h1 className="admin-system-setting-title">Cài Đặt Hệ Thống</h1>
                    <button 
                        className="admin-system-setting-add-btn"
                        onClick={() => navigate('/admin/settings/add')}
                    >
                        <FaPlus className="action-icon" /> Thêm Cài Đặt
                    </button>
                </div>
                <div className="admin-system-setting-controls">
                    <FilterBar
                        filters={filterConfig}
                        values={filterValues}
                        onChange={handleFilterChange}
                    />
                    <SearchBar
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Tìm kiếm cài đặt"
                        className="admin-system-setting-search-box"
                        inputClassName="admin-system-setting-search-input"
                    />
                </div>
                <div className="admin-system-setting-table-wrapper">
                    <table className="admin-system-setting-table">
                        <thead>
                            <tr>
                                <th>Key</th>
                                <th>
                                    <SortableHeader
                                        label="Loại"
                                        sortState={sortField === 'type' ? sortOrder : 'none'}
                                        onSort={() => handleSort('type')}
                                    />
                                </th>
                                <th>Danh mục</th>
                                <th>Giá Trị</th>
                                <th>Mô tả</th>
                                <th>
                                    <SortableHeader
                                        label="Trạng Thái"
                                        sortState={sortField === 'isPublic' ? sortOrder : 'none'}
                                        onSort={() => handleSort('isPublic')}
                                    />
                                </th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSettings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-system-setting-no-data">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                filteredSettings.map(setting => (
                                    <tr key={setting._id} className="admin-system-setting-row">
                                        <td>{setting.key}</td>
                                        <td>{setting.type}</td>
                                        <td>{setting.category}</td>
                                        <td>{typeof setting.value === 'object' 
                                            ? JSON.stringify(setting.value) 
                                            : String(setting.value)}
                                        </td>
                                        <td>{setting.description}</td>
                                        <td>
                                            <span className={`admin-system-setting-status admin-system-setting-status-${setting.isPublic ? 'active' : 'inactive'}`}>
                                                {STATUS_MAP[setting.isPublic]?.label}
                                            </span>
                                        </td>
                                        <td className="admin-system-setting-actions">
                                            <button 
                                                className="admin-system-setting-edit-btn"
                                                onClick={() => navigate(`/admin/settings/edit/${setting.key}`)}
                                                title="Sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="admin-system-setting-delete-btn"
                                                onClick={() => showDeleteConfirm(setting.key, setting.key)}
                                                title="Xóa"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="admin-system-setting-pagination"
                />
            </div>
            {/* Delete Confirmation Modal */}
            {deleteModal.visible && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal">
                        <div className="delete-modal-header">
                            <h3>Xác nhận xóa</h3>
                            <button 
                                className="delete-modal-close" 
                                onClick={handleCloseModal}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="delete-modal-content">
                            <p>Bạn có chắc chắn muốn xóa cài đặt <strong>"{deleteModal.settingName}"</strong>?</p>
                            <p className="delete-modal-warning">Hành động này không thể hoàn tác!</p>
                        </div>
                        <div className="delete-modal-actions">
                            <button 
                                className="delete-modal-cancel" 
                                onClick={handleCloseModal}
                            >
                                Hủy
                            </button>
                            <button 
                                className="delete-modal-confirm" 
                                onClick={handleDeleteSetting}
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Alert Notification */}
            {alert.visible && (
                <Alert 
                    message={alert.message}
                    type={alert.type}
                    onClose={handleCloseAlert}
                />
            )}
        </div>
    );
};
export default SystemSettingList;