import React, { useState } from 'react';
import './AdminOrderList.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import AdminCustomerDesignForm from './AdminCustomerDesignForm';
import Pagination from '../../components/ui/pagination/Pagination';
import { FaSearch } from 'react-icons/fa';

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
    const [openDesignForm, setOpenDesignForm] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [page, setPage] = useState(1);

    const filteredOrders = ordersData.filter(order =>
        order.name.toLowerCase().includes(search.toLowerCase())
    );

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
            patternImage: require('../../assets/images/arfg.jpg'),
        });
        setOpenDesignForm(true);
    };

    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
    const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="admin-order-list-container">
            <Breadcrumb />
            <div className="admin-order-list-content">
                <div className="admin-order-list-header-row">
                    <h2 className="admin-order-list-title">Đơn Hàng</h2>
                    <div className="admin-order-list-search">
                        <FaSearch className="admin-order-list-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm đơn hàng"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="admin-order-list-table-wrapper">
                    <table className="admin-order-list-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th style={{ width: 40 }}></th>
                                <th>Đơn hàng</th>
                                <th>Mã đơn hàng</th>
                                <th>Tổng</th>
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