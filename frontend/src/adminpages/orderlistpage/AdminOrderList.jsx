import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './AdminOrderList.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import AdminCustomerDesignForm from './AdminCustomerDesignForm';
import Pagination from '../../components/ui/pagination/Pagination';
import orderService from '../../services/orderService';

const PAGE_SIZE = 10;

// Default placeholder as data URL to avoid infinite loop
const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f4f8f4'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); // Separate debounced search
    const [filterValues, setFilterValues] = useState({
        status: '',
    });
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [openDesignForm, setOpenDesignForm] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0
    });

    // Debounce search input - separated from fetch logic
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page when search changes
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Use useCallback with stable dependencies
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit: PAGE_SIZE,
                sortBy: sortField,
                sortOrder,
                ...(filterValues.status && filterValues.status !== 'all' && { status: filterValues.status }),
                ...(debouncedSearch && { q: debouncedSearch })
            };

            // Use searchOrders if there is a filter or search, getAllOrders if not
            const response = debouncedSearch || (filterValues.status && filterValues.status !== 'all') 
                ? await orderService.searchOrders(params)
                : await orderService.getAllOrders(params);

            if (response.success) {
                setOrders(response.data || []);
                setPagination(response.pagination || { total: 0, totalPages: 0 });
            } else {
                setError('Không thể tải danh sách đơn hàng');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [page, sortField, sortOrder, filterValues.status, debouncedSearch]); // Use debouncedSearch instead of search

    // Load orders when stable dependencies change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handle search change - only update search state, don't reset page here
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        // Don't call setPage(1) here - let debounce effect handle it
    };

    const filterConfig = [
        {
            label: 'Trạng thái',
            field: 'status',
            options: [
                { label: 'Tất cả', value: 'all' },
                { label: 'Đang xử lý', value: 'pending' },
                { label: 'Đang giao hàng', value: 'shipped' },
                { label: 'Đã giao', value: 'delivered' },
                { label: 'Đã hủy', value: 'cancelled' },
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

    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') {
            nextOrder = 'desc';
        } else if (sortField === field && sortOrder === 'desc') {
            nextOrder = 'asc';
        }
        
        setSortField(field);
        setSortOrder(nextOrder);
        setPage(1);
    };

    // Handle image error with fallback to prevent infinite loop
    const handleImageError = (e) => {
        const img = e.target;
        // Prevent infinite loop by checking if already set to placeholder
        if (img.src !== DEFAULT_PLACEHOLDER) {
            img.src = DEFAULT_PLACEHOLDER;
        }
    };

    // Memoize expensive computation
    const mapOrderForDisplay = useCallback((order) => {
        const firstItem = order.items?.[0];
        const productData = firstItem?.productId;
        
        return {
            id: order._id,
            name: productData?.name || 'Sản phẩm không xác định',
            code: order._id.slice(-8).toUpperCase(), // Use last 8 chars of ID as order code
            total: order.totalAmount || 0,
            status: orderService.getStatusText(order.status),
            statusType: order.status,
            image: productData?.images?.[0] || productData?.imageUrl || DEFAULT_PLACEHOLDER,
            originalOrder: order, // Keep original order data for detail view
            customDesign: false, // This should come from order data if available
            createdAt: order.createdAt,
            items: order.items || []
        };
    }, []);

    // Optimize displayOrders with useMemo
    const displayOrders = useMemo(() => {
        return orders.map(mapOrderForDisplay);
    }, [orders, mapOrderForDisplay]);

    const handleShowDesign = (displayOrder) => {
        const originalOrder = displayOrder.originalOrder;
        const firstItem = originalOrder.items?.[0];
        const productData = firstItem?.productId;

        // Create design data from real order data
        setSelectedDesign({
            productImage: productData?.images?.[0] || productData?.imageUrl || DEFAULT_PLACEHOLDER,
            productName: productData?.name || 'Sản phẩm không xác định',
            color: firstItem?.color || 'Không xác định',
            quantity: firstItem?.quantity || 1,
            orderCode: displayOrder.code,
            price: originalOrder.totalAmount || 0,
            orderId: originalOrder._id,
            shippingAddress: originalOrder.shippingAddress,
            status: originalOrder.status,
            createdAt: originalOrder.createdAt,
            items: originalOrder.items,
            // Design specific data (should come from order if available)
            colorImage: productData?.images?.[0] || DEFAULT_PLACEHOLDER,
            text: 'Thiết kế khách hàng', // This should come from order customization data
            patternImage: DEFAULT_PLACEHOLDER, // This should come from order customization data
        });
        setOpenDesignForm(true);
    };

    if (loading) {
        return (
            <div className="admin-order-list-container">
                <Breadcrumb />
                <div className="admin-order-list-content">
                    <div className="admin-order-list-header-row">
                        <h2 className="admin-order-list-title">Đơn Hàng</h2>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div>Đang tải danh sách đơn hàng...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-order-list-container">
                <Breadcrumb />
                <div className="admin-order-list-content">
                    <div className="admin-order-list-header-row">
                        <h2 className="admin-order-list-title">Đơn Hàng</h2>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#F44336' }}>
                        <div>Lỗi: {error}</div>
                        <button 
                            onClick={fetchOrders}
                            style={{ 
                                marginTop: '16px', 
                                padding: '8px 16px', 
                                background: '#1a3c1a', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-order-list-container">
            <Breadcrumb />
            <div className="admin-order-list-content">
                <div className="admin-order-list-header-row">
                    <h2 className="admin-order-list-title">Đơn Hàng ({pagination.total})</h2>
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
                        placeholder="Tìm kiếm đơn hàng..."
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
                                        label="Mã đơn"
                                        sortState={sortField === '_id' ? sortOrder : 'none'}
                                        onSort={() => handleSort('_id')}
                                    />
                                </th>
                                <th style={{ width: 40 }}></th>
                                <th>Đơn hàng</th>
                                <th>Địa chỉ giao hàng</th>
                                <th>
                                    <SortableHeader
                                        label="Tổng tiền"
                                        sortState={sortField === 'totalAmount' ? sortOrder : 'none'}
                                        onSort={() => handleSort('totalAmount')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Trạng thái"
                                        sortState={sortField === 'status' ? sortOrder : 'none'}
                                        onSort={() => handleSort('status')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Ngày tạo"
                                        sortState={sortField === 'createdAt' ? sortOrder : 'none'}
                                        onSort={() => handleSort('createdAt')}
                                    />
                                </th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        Không có đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                displayOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <span className="admin-order-list-order-code">{order.code}</span>
                                        </td>
                                        <td>
                                            <img 
                                                src={order.image} 
                                                alt={order.name} 
                                                className="admin-order-list-product-img"
                                                onError={handleImageError}
                                            />
                                        </td>
                                        <td>
                                            <span className="admin-order-list-product-name">
                                                {order.name}
                                                {order.items.length > 1 && (
                                                    <span style={{ color: '#666', fontSize: '0.9em' }}>
                                                        {' '}+{order.items.length - 1} sản phẩm khác
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#4b5c4b', fontSize: '0.9em' }}>
                                                {order.originalOrder.shippingAddress?.length > 50 
                                                    ? order.originalOrder.shippingAddress.substring(0, 50) + '...'
                                                    : order.originalOrder.shippingAddress || 'Không có địa chỉ'
                                                }
                                            </span>
                                        </td>
                                        <td>
                                            <span className="admin-order-list-total">
                                                {orderService.formatPrice(order.total)}
                                            </span>
                                        </td>
                                        <td>
                                            <span 
                                                className={`admin-order-list-status admin-order-list-status-${order.statusType}`}
                                                style={{ color: orderService.getStatusColor(order.statusType) }}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#4b5c4b', fontSize: '0.9em' }}>
                                                {orderService.formatDate(order.createdAt)}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {pagination.totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                    />
                )}
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