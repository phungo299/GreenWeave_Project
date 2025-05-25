import React, { useState, useEffect } from 'react';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import axiosClient from '../../api/axiosClient';
import './UserList.css';

const STATUS_MAP = {
    false: { label: 'Đang hoạt động', className: 'active' },
    true: { label: 'Vô hiệu hóa', className: 'disabled' },
};

const PAGE_SIZE = 10;

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({
        status: '',
    });
    const [page, setPage] = useState(1);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('none');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/users/all');
                //console.log('API Response:', response);
                //console.log('API Response type:', typeof response);
                //console.log('API Response has data property:', response.hasOwnProperty('data'));
                //console.log('API Response data type:', typeof response.data);
                
                if (response && response.data) {
                    //console.log('Setting users to:', response);
                    setUsers(response);
                } else {
                    //console.error('No data in response');
                    setError('Không nhận được dữ liệu từ API.');
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filterConfig = [
        {
            label: 'Trạng thái',
            field: 'status',
            options: [
                { label: 'Tất cả', value: '' },
                { label: 'Đang hoạt động', value: 'false' },
                { label: 'Vô hiệu hóa', value: 'true' },
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
        id: (a, b, order) => order === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id),
        username: (a, b, order) => {
            const aUsername = a.username || '';
            const bUsername = b.username || '';
            return order === 'asc' ? aUsername.localeCompare(bUsername) : bUsername.localeCompare(aUsername);
        },
        email: (a, b, order) => order === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email),
        address: (a, b, order) => {
            const aAddress = a.address || '';
            const bAddress = b.address || '';
            return order === 'asc' ? aAddress.localeCompare(bAddress) : bAddress.localeCompare(aAddress);
        }
    };

    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'none';
        setSortField(nextOrder === 'none' ? '' : field);
        setSortOrder(nextOrder);
    };

    // Handle user state on/off
    const toggleUserStatus = async (userId) => {
        try {
            await axiosClient.patch(`/users/toggle-status/${userId}`);
            setUsers(prevUsers => {
                return {
                    ...prevUsers,
                    data: prevUsers.data.map(user => 
                        user.id === userId 
                            ? { ...user, isDisabled: !user.isDisabled } 
                            : user
                    )
                };
            });
        } catch (err) {
            console.error('Error toggling user status:', err);
            alert('Không thể thay đổi trạng thái người dùng. Vui lòng thử lại sau.');
        }
    };

    let filteredUsers = [];
    
    if (users && users.data) {
        filteredUsers = users.data.filter(user => {
            const matchSearch = 
                ((user.username || '').toLowerCase().includes(search.toLowerCase())) || 
                ((user.email || '').toLowerCase().includes(search.toLowerCase()));
                ((user.address || '').toLowerCase().includes(search.toLowerCase()));
            const matchStatus = filterValues.status === '' || 
                              String(user.isDisabled) === filterValues.status;
            return matchSearch && matchStatus;
        });
    }
    

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

    if (loading) {
        return <div className="admin-user-list-loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="admin-user-list-error">{error}</div>;
    }

    return (
        <div className="admin-user-list-container">
            <AdminBreadcrumb />
            <div className="admin-user-list-content">
                <div className="admin-user-list-header-row">
                    <h1 className="admin-user-list-title">Người Dùng</h1>
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
                                        label="Tên đăng nhập"
                                        sortState={sortField === 'username' ? sortOrder : 'none'}
                                        onSort={() => handleSort('username')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Email"
                                        sortState={sortField === 'email' ? sortOrder : 'none'}
                                        onSort={() => handleSort('email')}
                                    />
                                </th>
                                <th>Số điện thoại</th>
                                <th>
                                    <SortableHeader
                                        label="Địa chỉ"
                                        sortState={sortField === 'address' ? sortOrder : 'none'}
                                        onSort={() => handleSort('address')}
                                    />
                                </th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="admin-user-list-row">
                                        <td>{user.id.substring(0, 8)}...</td>
                                        <td>
                                            <div 
                                                className="admin-user-list-avatar"
                                                style={{ 
                                                    background: user.avatar ? 'transparent' : '#C9D8CD',
                                                    backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                        </td>
                                        <td>{user.username || '-'}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || 'Chưa cập nhật'}</td>
                                        <td>{user.address || 'Chưa cập nhật'}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <div className={`admin-user-list-status admin-user-list-status-${user.isDisabled ? 'disabled' : 'active'}`}>
                                                {STATUS_MAP[user.isDisabled]?.label}
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                className="admin-user-list-action-btn"
                                                onClick={() => toggleUserStatus(user.id)}
                                            >
                                                {user.isDisabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="admin-user-list-no-data">
                                        Không có dữ liệu phù hợp
                                    </td>
                                </tr>
                            )}
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