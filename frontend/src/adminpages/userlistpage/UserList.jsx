import React, { useState } from 'react';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import './UserList.css';

const MOCK_USERS = [
    {
        id: 1,
        name: 'Trần Minh Hiếu',
        email: 'brooklyn.simmons@gmail.com',
        address: '1234 Hoàng Văn Thụ, TP Quy Nhơn',
        color: '#C9D8CD',
        status: 'unverified'
    },
    {
        id: 2,
        name: 'Trần Thảo Vy',
        email: 'brooklyn.simmons@gmail.com',
        address: '1234 Hoàng Văn Thụ, TP Quy Nhơn',
        color: '#C9D8CD',
        status: 'active'
    },
    {
        id: 3,
        name: 'Nguyễn Thiên Kim',
        email: 'brooklyn.simmons@gmail.com',
        address: '1234 Hoàng Văn Thụ, TP Quy Nhơn',
        color: '#F6A96B',
        status: 'disabled'
    },
    {
        id: 4,
        name: 'Doãn Hải My',
        email: 'brooklyn.simmons@gmail.com',
        address: '1234 Hoàng Văn Thụ, TP Quy Nhơn',
        color: '#5B7CB2',
        status: 'active'
    },
];

const STATUS_MAP = {
    unverified: { label: 'Chưa xác thực', className: 'unverified' },
    active: { label: 'Đang hoạt động', className: 'active' },
    disabled: { label: 'Vô hiệu hóa', className: 'disabled' },
};

const PAGE_SIZE = 10;

const UserList = () => {
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({
        status: '',
    });
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('none');

    const filterConfig = [
        {
            label: 'Trạng thái',
            field: 'status',
            options: [
                { label: 'Tất cả', value: '' },
                { label: 'Chưa xác thực', value: 'unverified' },
                { label: 'Đang hoạt động', value: 'active' },
                { label: 'Vô hiệu hóa', value: 'disabled' },
            ],
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
        email: (a, b, order) => order === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email),
    };

    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'none';
        setSortField(nextOrder === 'none' ? '' : field);
        setSortOrder(nextOrder);
    };

    const filteredUsers = MOCK_USERS.filter(user => {
        const matchSearch = user.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterValues.status || user.status === filterValues.status;
        return matchSearch && matchStatus;
    });

    let sortedUsers = [...filteredUsers];
    if (sortField && sortOrder !== 'none') {
        sortedUsers.sort((a, b) => sortFunctions[sortField](a, b, sortOrder));
    }
    const paginatedUsers = sortedUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div className="admin-user-list-container">
            <AdminBreadcrumb />
            <div className="admin-user-list-content">
                <div className="admin-user-list-header-row">
                    <h1 className="admin-user-list-title">Người dùng</h1>
                </div>
                <div className="admin-user-list-controls">
                    <FilterBar
                        filters={filterConfig}
                        values={filterValues}
                        onChange={handleFilterChange}
                    />
                    <SearchBar
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Tìm khách hàng"
                        className="admin-user-list-search-box"
                        inputClassName="admin-user-list-search-input"
                    />
                </div>
                <div className="admin-user-list-table-wrapper">
                    <table className="admin-user-list-table">
                        <thead>
                            <tr>
                                <th>
                                    <SortableHeader
                                        label="ID"
                                        sortState={sortField === 'id' ? sortOrder : 'none'}
                                        onSort={() => handleSort('id')}
                                    />
                                </th>
                                <th></th>
                                <th>
                                    <SortableHeader
                                        label="Họ và tên"
                                        sortState={sortField === 'name' ? sortOrder : 'none'}
                                        onSort={() => handleSort('name')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Email"
                                        sortState={sortField === 'email' ? sortOrder : 'none'}
                                        onSort={() => handleSort('email')}
                                    />
                                </th>
                                <th>Địa chỉ</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user, idx) => (
                                <tr key={user.id} className="admin-user-list-row">
                                    <td>{user.id}</td>
                                    <td>
                                        <div className="admin-user-list-avatar" style={{ background: user.color }} />
                                    </td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.address}</td>
                                    <td>
                                        <div className={`admin-user-list-status admin-user-list-status-${user.status}`}>
                                            {STATUS_MAP[user.status]?.label}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="admin-user-list-action-btn">Quản lý</button>
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
                    className="admin-user-list-pagination"
                />
            </div>
        </div>
    );
};
export default UserList;