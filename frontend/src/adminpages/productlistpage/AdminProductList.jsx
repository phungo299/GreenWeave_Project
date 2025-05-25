import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProductList.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import productService from '../../services/productService';

const AdminProductList = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('none'); // 'asc', 'desc', 'none'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

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

    // Fetch products on component mount and when filters/pagination change
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);               
                // Prepare query parameters
                const params = {
                    page: currentPage,
                    limit: pageSize,
                };              
                // Add category filter if selected
                if (filterValues.category) {
                    params.categoryId = filterValues.category;
                }               
                // Add status filter if selected
                if (filterValues.status) {
                    params.status = filterValues.status === 'in-stock' ? true : false;
                }             
                // Add search query if provided
                if (search) {
                    params.q = search;
                }                
                console.log('Fetching products with params:', params);             
                const response = await productService.getAll(params);
                console.log('API Response:', response);               
                if (response && response.products) {
                    // Transform product data to match our table structure
                    const formattedProducts = response.products.map(product => ({
                        id: product.id,
                        image: product.imageUrl || '/path/to/default-image.jpg',
                        name: product.name,
                        orderCode: product.id, // Using ID as orderCode
                        price: `${product.price.toLocaleString()} đ`,
                        stock: product.stock > 0 ? 'Còn hàng' : 'Hết hàng',
                        category: product.categoryId,
                        note: product.description || '...'
                    }));                   
                    setProducts(formattedProducts);                   
                    // Update pagination info
                    if (response.pagination) {
                        setTotalPages(response.pagination.totalPages || 1);
                    }
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [currentPage, pageSize, filterValues, search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleFilterChange = (field, value) => {
        setFilterValues(prev => ({
            ...prev,
            [field]: value,
        }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const sortFunctions = {
        name: (a, b, order) => order === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
        price: (a, b, order) => {
            const priceA = parseInt(a.price.replace(/\D/g, ''));
            const priceB = parseInt(b.price.replace(/\D/g, ''));
            return order === 'asc' ? priceA - priceB : priceB - priceA;
        },
    };
      
    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'none';
        setSortField(nextOrder === 'none' ? '' : field);
        setSortOrder(nextOrder);
    };
      
    let sortedProducts = [...products];
    if (sortField && sortOrder !== 'none') {
        sortedProducts.sort((a, b) => sortFunctions[sortField](a, b, sortOrder));
    }

    const handleAddProduct = () => {
        navigate('/admin/products/add');
    };

    const handleUpdateProduct = (productId) => {
        navigate(`/admin/products/edit/${productId}`);
    };

    return (
        <div className="admin-product-list-container">
            <Breadcrumb />           
            <div className="admin-product-list-header">
                <h1>Sản Phẩm</h1>
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
                {loading ? (
                    <div className="admin-product-list-loading">Đang tải...</div>
                ) : error ? (
                    <div className="admin-product-list-error">{error}</div>
                ) : (
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
                                <th>Mã sản phẩm</th>
                                <th>
                                    <SortableHeader
                                        label="Giá"
                                        sortState={sortField === 'price' ? sortOrder : 'none'}
                                        onSort={() => handleSort('price')}
                                    />
                                </th>
                                <th>Kho hàng</th>
                                <th>Thể loại</th>
                                <th>Note</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="admin-product-list-no-data">
                                        Không có sản phẩm nào
                                    </td>
                                </tr>
                            ) : (
                                sortedProducts.map((product, index) => (
                                    <tr key={product.id}>
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td className="admin-product-list-name-cell">
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                className="admin-product-list-product-image"
                                                onError={(e) => {e.target.src = '/placeholder.jpg'}}
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
                                ))
                            )}
                        </tbody>
                    </table>
                )}
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