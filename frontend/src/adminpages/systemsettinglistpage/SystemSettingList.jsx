import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import './SystemSettingList.css';

// Mock data
const MOCK_SETTINGS = [
    { id: 1, name: 'Max Login Attempts', type: 'Security', value: '5', priority: 1, status: 'active' },
    { id: 2, name: 'Site Title', type: 'General', value: 'GreenWeave', priority: 2, status: 'active' },
    { id: 3, name: 'Maintenance Mode', type: 'General', value: 'Off', priority: 3, status: 'inactive' },
    { id: 4, name: 'Session Timeout', type: 'Security', value: '30m', priority: 4, status: 'active' },
];

const STATUS_MAP = {
    active: { label: 'Hoạt động', className: 'active' },
    inactive: { label: 'Không hoạt động', className: 'inactive' },
};

const TYPE_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'General', value: 'General' },
    { label: 'Security', value: 'Security' },
];

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Hoạt động', value: 'active' },
    { label: 'Không hoạt động', value: 'inactive' },
];

const PAGE_SIZE = 10;

const SystemSettingList = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({
        type: '',
        status: '',
    });
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('none');

    const filterConfig = [
        {
            label: 'Loại',
            field: 'type',
            options: TYPE_OPTIONS,
        },
        {
            label: 'Trạng Thái',
            field: 'status',
            options: STATUS_OPTIONS,
        },
    ];

    const handleFilterChange = (field, value) => {
        setFilterValues(prev => ({
            ...prev,
            [field]: value,
        }));
        setPage(1);
    };

    const sortFunctions = {
        id: (a, b, order) => order === 'asc' ? a.id - b.id : b.id - a.id,
        name: (a, b, order) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
        priority: (a, b, order) => order === 'asc' ? a.priority - b.priority : b.priority - a.priority,
    };

    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'none';
        setSortField(nextOrder === 'none' ? '' : field);
        setSortOrder(nextOrder);
    };

    // Filter
    const filteredSettings = MOCK_SETTINGS.filter(setting => {
        const matchSearch =
            setting.name.toLowerCase().includes(search.toLowerCase()) ||
            setting.value.toLowerCase().includes(search.toLowerCase());
        const matchType = !filterValues.type || setting.type === filterValues.type;
        const matchStatus = !filterValues.status || setting.status === filterValues.status;
        return matchSearch && matchType && matchStatus;
    });

    // Sort
    let sortedSettings = [...filteredSettings];
    if (sortField && sortOrder !== 'none') {
        sortedSettings.sort((a, b) => sortFunctions[sortField](a, b, sortOrder));
    }

    // Pagination
    const paginatedSettings = sortedSettings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(filteredSettings.length / PAGE_SIZE);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

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
                        Thêm Cài Đặt
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
                                <th>
                                    <SortableHeader
                                        label="ID"
                                        sortState={sortField === 'id' ? sortOrder : 'none'}
                                        onSort={() => handleSort('id')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Tên"
                                        sortState={sortField === 'name' ? sortOrder : 'none'}
                                        onSort={() => handleSort('name')}
                                    />
                                </th>
                                <th>Loại</th>
                                <th>Giá Trị</th>
                                <th>
                                    <SortableHeader
                                        label="Độ Ưu Tiên"
                                        sortState={sortField === 'priority' ? sortOrder : 'none'}
                                        onSort={() => handleSort('priority')}
                                    />
                                </th>
                                <th>Trạng Thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSettings.map(setting => (
                                <tr key={setting.id} className="admin-system-setting-row">
                                    <td>{setting.id}</td>
                                    <td>{setting.name}</td>
                                    <td>{setting.type}</td>
                                    <td>{setting.value}</td>
                                    <td>{setting.priority}</td>
                                    <td>
                                        <span className={`admin-system-setting-status admin-system-setting-status-${setting.status}`}>
                                            {STATUS_MAP[setting.status]?.label}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="admin-system-setting-action-btn"
                                            onClick={() => navigate(`/admin/settings/edit/${setting.id}`)}
                                        >
                                            Sửa
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
        </div>
    );
};
export default SystemSettingList;