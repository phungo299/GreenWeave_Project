import React, { useState } from 'react';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
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
    const [page, setPage] = useState(1);

    const filteredUsers = MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
    const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                                <th>ID</th>
                                <th></th>
                                <th>Họ và tên</th>
                                <th>Email</th>
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