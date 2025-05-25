import React, { useState } from 'react';
import './AdminOrderList.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import AdminCustomerDesignForm from './AdminCustomerDesignForm';
import Pagination from '../../components/ui/pagination/Pagination';

const ordersData = [
    {
        id: 1,
        name: 'Mũ lưỡi trai',
        code: '47514501',
        total: 220000,
        status: 'Đang xử lý',
        statusType: 'processing',
        image: require('../../assets/images/cap-3.jpg'),
        customDesign: false,
    },
    {
        id: 2,
        name: 'Túi tote',
        code: '47514501',
        total: 220000,
        status: 'Đã Giao',
        statusType: 'delivered',
        image: require('../../assets/images/recycled-tote-bag-3.jpg'),
        customDesign: false,
    },
    {
        id: 3,
        name: 'Balo',
        code: '47514501',
        total: 220000,
        status: 'Đã Giao',
        statusType: 'delivered',
        image: require('../../assets/images/IMG_8416.JPG'),
        customDesign: false,
    },
    {
        id: 4,
        name: 'Áo phông',
        code: '47514501',
        total: 220000,
        status: 'Đã Giao',
        statusType: 'delivered',
        image: require('../../assets/images/T-shirt products.jpg'),
        customDesign: false,
    },
];

const PAGE_SIZE = 10;

const AdminOrderList = () => {
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({
        status: '',
    });
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('none');
    const [openDesignForm, setOpenDesignForm] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [page, setPage] = useState(1);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const filterConfig = [
        {
            label: 'Trạng thái',
            field: 'status',
            options: [
                { label: 'Tất cả', value: 'all' },
                { label: 'Đang xử lý', value: 'processing' },
                { label: 'Đã Giao', value: 'delivered' },
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

    const filteredOrders = ordersData.filter(order => {
        // Filter by search
        const matchSearch = order.name.toLowerCase().includes(search.toLowerCase());
        // Filter by status
        const matchStatus = !filterValues.status || filterValues.status === 'all' || order.statusType === filterValues.status;
        return matchSearch && matchStatus;
    });

    const sortFunctions = {
        id: (a, b, order) => order === 'asc' ? a.id - b.id : b.id - a.id,
        code: (a, b, order) => order === 'asc' ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code),
        total: (a, b, order) => order === 'asc' ? a.total - b.total : b.total - a.total,
    };

    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'none';
        setSortField(nextOrder === 'none' ? '' : field);
        setSortOrder(nextOrder);
    };

    let sortedOrders = [...filteredOrders];
    if (sortField && sortOrder !== 'none') {
        sortedOrders.sort((a, b) => sortFunctions[sortField](a, b, sortOrder));
    }
    const paginatedOrders = sortedOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleShowDesign = (order) => {
        // Simulate design data, real data taken from order or API
        setSelectedDesign({
            productImage: order.image,
            productName: order.name,
            color: 'Green',
            quantity: 1,
            orderCode: order.code,
            price: order.total,
            colorImage: require('../../assets/images/cap-3.jpg'),
            text: 'kiti',
            patternImage: require('../../assets/images/SP11.jpg'),
        });
        setOpenDesignForm(true);
    };

    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

    return (
        <div className="admin-order-list-container">
            <Breadcrumb />
            <div className="admin-order-list-content">
                <div className="admin-order-list-header-row">
                    <h2 className="admin-order-list-title">Đơn Hàng</h2>
                </div>
                <div className="admin-order-list-controls">
                    <FilterBar
                        filters={filterConfig}
                        values={filterValues}
                        onChange={handleFilterChange}
                    />
                    <SearchBar
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Tìm đơn hàng"
                        className="admin-order-list-search-box"
                        inputClassName="admin-order-list-search-input"
                    />
                </div>
                <div className="admin-order-list-table-wrapper">
                    <table className="admin-order-list-table">
                        <thead>
                            <tr>
                                <th>
                                    <SortableHeader
                                        label="ID"
                                        sortState={sortField === 'id' ? sortOrder : 'none'}
                                        onSort={() => handleSort('id')}
                                    />
                                </th>
                                <th style={{ width: 40 }}></th>
                                <th>Đơn hàng</th>
                                <th>
                                    <SortableHeader
                                        label="Mã đơn hàng"
                                        sortState={sortField === 'code' ? sortOrder : 'none'}
                                        onSort={() => handleSort('code')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Tổng"
                                        sortState={sortField === 'total' ? sortOrder : 'none'}
                                        onSort={() => handleSort('total')}
                                    />
                                </th>
                                <th>Trạng thái</th>
                                <th>Thiết kế khách hàng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>
                                        <img src={order.image} alt={order.name} className="admin-order-list-product-img" />
                                    </td>
                                    <td>
                                        <span className="admin-order-list-product-name">{order.name}</span>
                                    </td>
                                    <td>
                                        <span className="admin-order-list-order-code">{order.code}</span>
                                    </td>
                                    <td>
                                        <span className="admin-order-list-total">{order.total.toLocaleString()} đ</span>
                                    </td>
                                    <td>
                                        <span className={`admin-order-list-status admin-order-list-status-${order.statusType}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-order-list-detail-btn-wrapper">
                                            <button
                                                className="admin-order-list-detail-btn"
                                                onClick={() => handleShowDesign(order)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
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
                />
            </div>
            <AdminCustomerDesignForm
                    open={openDesignForm}
                    onClose={() => setOpenDesignForm(false)}
                    design={selectedDesign || {}}
            />
        </div>
    );
};
export default AdminOrderList;