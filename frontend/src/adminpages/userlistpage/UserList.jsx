import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import userService from '../../services/userService';
import './UserList.css';
import { FaEdit, FaToggleOn, FaEye, FaToggleOff, FaUserPlus } from 'react-icons/fa';

const STATUS_MAP = {
    false: { label: 'Đang hoạt động', className: 'active' },
    true: { label: 'Vô hiệu hóa', className: 'disabled' },
};

const PAGE_SIZE = 10;

const UserList = () => {
    const navigate = useNavigate();
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
                const response = await userService.getAllIncludingAdmin();
                console.log('API Response:', response);
                console.log('API Response type:', typeof response);
                console.log('API Response has data property:', response.hasOwnProperty('data'));
                console.log('API Response data type:', typeof response.data);
                
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
                { label: 'Tất cả', value: 'all' },
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
            // Convert address objects to strings for comparison
            const getAddressString = (user) => {
                if (!user.address) return '';
                if (typeof user.address === 'string') return user.address;
                if (typeof user.address === 'object') {
                    const addr = user.address;
                    return [
                        addr.streetAddress,
                        addr.ward,
                        addr.district,
                        addr.province,
                        addr.country
                    ].filter(Boolean).join(' ');
                }
                return '';
            };     
            const aAddress = getAddressString(a);
            const bAddress = getAddressString(b);
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
            await userService.toggleStatus(userId);
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
            // Get a string representation of address if it's an object
            let addressStr = '';
            if (user.address) {
                if (typeof user.address === 'string') {
                    addressStr = user.address;
                } else if (typeof user.address === 'object') {
                    // Extract address properties and concatenate them
                    const addr = user.address;
                    addressStr = [
                        addr.streetAddress,
                        addr.ward,
                        addr.district,
                        addr.province,
                        addr.country
                    ].filter(Boolean).join(' ');
                }
            }
            const matchSearch = 
                ((user.username || '').toLowerCase().includes(search.toLowerCase())) || 
                ((user.email || '').toLowerCase().includes(search.toLowerCase())) ||
                (addressStr.toLowerCase().includes(search.toLowerCase()));       
            const matchStatus = !filterValues.status || filterValues.status === 'all' || 
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

    const handleAddUser = () => {
        console.log('Add new user');
        // Implement add user functionality
        alert('Chức năng thêm người dùng sẽ được phát triển sau.');
    };

    const handleViewUser = (userId) => {
        navigate(`/admin/users/detail/${userId}`);
    };

    const handleEditUser = (userId) => {
        console.log('Edit user:', userId);
        // Implement edit user functionality
        // For example, navigate to edit page or open a modal
    };

    return (
        <div className="admin-user-list-container">
            <AdminBreadcrumb />
            <div className="admin-user-list-content">
                <div className="admin-user-list-header-row">
                    <h1 className="admin-user-list-title">Người Dùng</h1>
                    <button className="admin-user-list-add-btn" onClick={handleAddUser}>
                        <FaUserPlus className="admin-user-list-add-icon" />
                        Add User
                    </button>
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
                                        <td>
                                            {(() => {
                                                if (!user.address) return 'Chưa cập nhật';
                                                if (typeof user.address === 'string') return user.address;
                                                if (typeof user.address === 'object') {
                                                    const addr = user.address;
                                                    return [
                                                        addr.streetAddress,
                                                        addr.ward,
                                                        addr.district,
                                                        addr.province,
                                                        addr.country
                                                    ].filter(Boolean).join(', ');
                                                }
                                                return 'Chưa cập nhật';
                                            })()}
                                        </td>
                                        <td>{user.role}</td>
                                        <td>
                                            <div className={`admin-user-list-status admin-user-list-status-${user.isDisabled ? 'disabled' : 'active'}`}>
                                                {STATUS_MAP[user.isDisabled]?.label}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-user-list-actions">
                                                {user.role === 'admin' ? (
                                                    <button 
                                                        className="admin-user-list-icon-btn view"
                                                        onClick={() => handleViewUser(user.id)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button 
                                                            className="admin-user-list-icon-btn edit"
                                                            onClick={() => handleEditUser(user.id)}
                                                            title="Chỉnh sửa thông tin"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            className="admin-user-list-icon-btn toggle"
                                                            onClick={() => toggleUserStatus(user.id)}
                                                            title={user.isDisabled ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản'}
                                                        >
                                                            {user.isDisabled ? <FaToggleOff /> : <FaToggleOn />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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