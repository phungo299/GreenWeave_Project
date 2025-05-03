import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProductList.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';

const AdminProductList = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('none'); // 'asc', 'desc', 'none'

    const [products] = useState([
        { id: 1, image: '/path/to/image1.jpg', name: 'Mũ lưỡi trai', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ',  note: '...'},
        { id: 2, image: '/path/to/image2.jpg', name: 'Túi tote', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ', note: '...'},
        { id: 3, image: '/path/to/image3.jpg', name: 'Balo', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ', note: '...'},
        { id: 4, image: '/path/to/image4.jpg', name: 'Áo phông', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ', note: '...'},
    ]);

    const [filterValues, setFilterValues] = useState({
        status: '',
        category: '',
    });

    const filterConfig = [
        {
            label: 'Trạng thái',
            field: 'status',
            options: [
                { label: 'Còn hàng', value: 'in-stock' },
                { label: 'Hết hàng', value: 'out-of-stock' },
            ],
        },
        {
            label: 'Thể loại',
            field: 'category',
            options: [
                { label: 'Mũ', value: 'hat' },
                { label: 'Túi', value: 'bag' },
                { label: 'Quần áo', value: 'clothing' },
            ],
        },
    ];

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        // If you want to filter products by search, filter in render or create variable filteredProducts
    };

    const handleFilterChange = (field, value) => {
        setFilterValues(prev => ({
            ...prev,
            [field]: value,
        }));
        // Can filter data here or in render
    };

    const filteredProducts = products.filter(product => {
        if (filterValues.status && (filterValues.status === 'in-stock' ? product.stock !== 'Còn hàng' : product.stock !== 'Hết hàng')) {
            return false;
        }
        if (filterValues.category && product.category !== filterValues.category) {
            return false;
        }
        // ... other filters if any
        return true;
    });

    const sortFunctions = {
        name: (a, b, order) => order === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
        price: (a, b, order) => order === 'asc'
            ? parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''))
            : parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')),
        // ... other fields
    };
      
    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'none';
        setSortField(nextOrder === 'none' ? '' : field);
        setSortOrder(nextOrder);
    };
      
    let sortedProducts = [...filteredProducts];
    if (sortField && sortOrder !== 'none') {
        sortedProducts.sort((a, b) => sortFunctions[sortField](a, b, sortOrder));
    }

    const handleAddProduct = () => {
        navigate('/admin/products/add');
    };

    const handleUpdateProduct = (productId) => {
        navigate(`/admin/products/edit/${productId}`);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 24;

    return (
        <div className="admin-product-list-container">
            <Breadcrumb />           
            <div className="admin-product-list-header">
                <h1>Sản phẩm</h1>
                <button 
                    className="admin-product-list-add-button"
                    onClick={handleAddProduct}
                >
                    Thêm sản phẩm
                </button>
            </div>
            <div className="admin-product-list-controls">
                <FilterBar
                    filters={filterConfig}
                    values={filterValues}
                    onChange={handleFilterChange}
                />
                <SearchBar
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Tìm sản phẩm"
                    className="admin-product-list-search"
                    inputClassName="admin-product-list-search-input"
                />
            </div>
            <div className="admin-product-list-table-container">
                <table className="admin-product-list-table">
                    <thead>
                        <tr>
                            <th>TT</th>
                            <th>
                                <SortableHeader
                                    label="Tên sản phẩm"
                                    sortState={sortField === 'name' ? sortOrder : 'none'}
                                    onSort={() => handleSort('name')}
                                />
                            </th>
                            <th>
                                <SortableHeader
                                    label="Giá"
                                    sortState={sortField === 'price' ? sortOrder : 'none'}
                                    onSort={() => handleSort('price')}
                                />
                            </th>
                            <th>Giá</th>
                            <th>Kho hàng</th>
                            <th>Thể loại</th>
                            <th>Note</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product.id}>
                                <td>{index + 1}</td>
                                <td className="admin-product-list-name-cell">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="admin-product-list-product-image"
                                    />
                                    {product.name}
                                </td>
                                <td>{product.orderCode}</td>
                                <td>{product.price}</td>
                                <td>{product.stock}</td>
                                <td>{product.category}</td>
                                <td>{product.note}</td>
                                <td>
                                    <div className="admin-product-list-actions">
                                        <button 
                                            className="admin-product-list-action-button update"
                                            onClick={() => handleUpdateProduct(product.id)}
                                        >
                                            Cập nhật
                                        </button>
                                        <button className="admin-product-list-action-button delete">
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};
export default AdminProductList;