import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProductList.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import FilterBar from '../../components/ui/filterbar/FilterBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import productService from '../../services/productService';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const AdminProductList = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
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

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await productService.getCategories();
                if (response && response.categories) {
                    setCategories(response.categories);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        
        fetchCategories();
    }, []);

    // Dynamically build filter config based on fetched categories
    const getFilterConfig = () => {
        const categoryOptions = [
            { label: 'Tất cả', value: '' },
            ...categories.map(category => ({
                label: category.name,
                value: category._id
            }))
        ];
        return [
            {
                label: 'Trạng thái',
                field: 'status',
                options: [
                    { label: 'Tất cả', value: '' },
                    { label: 'Còn hàng', value: 'in-stock' },
                    { label: 'Hết hàng', value: 'out-of-stock' },
                ],
            },
            {
                label: 'Thể loại',
                field: 'category',
                options: categoryOptions,
            },
        ];
    };

    // Fetch products on component mount and when filters/pagination change
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);               
                // Prepare query parameters
                const params = {
                    page: currentPage,
                    limit: pageSize,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
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
                let response;
                // Use different API endpoint if search is provided
                if (search) {
                    response = await productService.search(search);
                } else {
                    response = await productService.getAll(params);
                }               
                //console.log('Fetching products with params:', params);
                //console.log('API Response:', response);               
                if (response && response.products) {
                    // Transform product data to match our table structure
                    const formattedProducts = response.products.map(product => ({
                        id: product._id || '',
                        image: (product.imageUrl && product.imageUrl.startsWith('http')) 
                            ? product.imageUrl 
                            : (product.images && product.images.length > 0) 
                                ? product.images[0] 
                                : null,
                        name: product.name,
                        productCode: product.productCode || product._id,
                        price: `${product.price.toLocaleString()} đ`,
                        stock: product.stock === "Còn hàng" || product.quantity > 0 ? 'Còn hàng' : 'Hết hàng',
                        category: product.categoryId && typeof product.categoryId === 'object' 
                            ? product.categoryId.name 
                            : (product.category || 'Chưa phân loại'),
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
        const value = e.target.value;
        setSearch(value);
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
        if (productId) {
            //console.log('Edit product:', productId);
            navigate(`/admin/products/edit/${productId}`);
        } else {
            alert('Không thể chỉnh sửa sản phẩm này. ID không hợp lệ');
        }
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
            try {
                setLoading(true);
                productService.delete(productId)
                    .then(response => {
                        if (response && response.success) {
                            alert('Xóa sản phẩm thành công');
                            // Refresh the product list
                            const updatedProducts = products.filter(product => product.id !== productId);
                            setProducts(updatedProducts);
                        } else {
                            alert('Xóa sản phẩm thất bại: ' + (response?.message || 'Lỗi không xác định'));
                        }
                    })
                    .catch(err => {
                        console.error('Error deleting product:', err);
                        alert('Không thể xóa sản phẩm: ' + (err.message || 'Lỗi không xác định'));
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Không thể xóa sản phẩm: ' + (err.message || 'Lỗi không xác định'));
                setLoading(false);
            }
        }
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
                    filters={getFilterConfig()}
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
                                    <tr key={`product-${product.id || index}`}>
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td className="admin-product-list-name-cell">
                                            <div className="admin-product-list-product-image-container">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    className="admin-product-list-product-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNDOUQ4Q0QiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzEyNTEzRCI+SU1HPC90ZXh0Pjwvc3ZnPg==';
                                                    }}
                                                />
                                            </div>
                                            {product.name}
                                        </td>
                                        <td>{product.productCode}</td>
                                        <td>{product.price}</td>
                                        <td>{product.stock}</td>
                                        <td>{product.category}</td>
                                        <td>{product.note}</td>
                                        <td>
                                            <div className="admin-product-list-actions">
                                                <button 
                                                    className="admin-product-list-icon-btn edit"
                                                    onClick={() => handleUpdateProduct(product.id)}
                                                    title="Chỉnh sửa thông tin"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="admin-product-list-icon-btn delete"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    title="Xóa sản phẩm"
                                                >
                                                    <FaTrashAlt />
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