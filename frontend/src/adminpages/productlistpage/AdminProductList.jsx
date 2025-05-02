import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProductList.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import Pagination from '../../components/ui/pagination/Pagination';
import { FaSearch, FaSort } from 'react-icons/fa';

const AdminProductList = () => {
    const navigate = useNavigate();

    const [products] = useState([
        { id: 1, image: '/path/to/image1.jpg', name: 'Mũ lưỡi trai', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ',  note: '...'},
        { id: 2, image: '/path/to/image2.jpg', name: 'Túi tote', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ', note: '...'},
        { id: 3, image: '/path/to/image3.jpg', name: 'Balo', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ', note: '...'},
        { id: 4, image: '/path/to/image4.jpg', name: 'Áo phông', orderCode: '47514501', price: '220,000 đ', stock: 'Còn hàng', category: 'Mũ', note: '...'},
    ]);

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
                <div className="admin-product-list-filters">
                    <select className="admin-product-list-filter">
                        <option value="">Trạng thái</option>
                        <option value="in-stock">Còn hàng</option>
                        <option value="out-of-stock">Hết hàng</option>
                    </select>
                    <select className="admin-product-list-filter">
                        <option value="">Thể loại</option>
                        <option value="hat">Mũ</option>
                        <option value="bag">Túi</option>
                        <option value="clothing">Quần áo</option>
                    </select>
                </div>
                <div className="admin-product-list-search">
                    <FaSearch className="admin-product-list-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm sản phẩm"
                        className="admin-product-list-search-input"
                    />
                </div>
            </div>
            <div className="admin-product-list-table-container">
                <table className="admin-product-list-table">
                    <thead>
                        <tr>
                            <th>TT</th>
                            <th>
                                Tên sản phẩm
                                <FaSort className="admin-product-list-sort-icon" />
                            </th>
                            <th>
                                Mã đơn hàng
                                <FaSort className="admin-product-list-sort-icon" />
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