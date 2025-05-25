import React, { useState, useEffect } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import './AdminProductDetails.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';

const AdminProductDetails = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [productData, setProductData] = useState({
        title: '',
        price: '',
        stock: 'Còn hàng',
        quantity: '',
        category: '',
        slug: '',
        productCode: '',
        description: '',
        images: [],
        selectedColor: '',
        selectedSize: ''
    });

    const availableColors = ['#E5E7EB', '#FDE68A', '#A7F3D0', '#93C5FD'];
    const availableSizes = ['S', 'M', 'X', 'XL', 'XXL'];

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/categories', {
                    params: {
                        page: 1,
                        limit: 100 // Get a large number to avoid pagination
                    }
                });              
                if (response && response.categories) {
                    setCategories(response.categories);
                } else {
                    console.error('Invalid response format:', response);
                    setError('Không thể tải danh mục sản phẩm');
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Không thể tải danh mục sản phẩm');
            } finally {
                setLoading(false);
            }
        };
    
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStockChange = (e) => {
        const stockValue = e.target.value;
        setProductData(prev => ({
            ...prev,
            stock: stockValue,
            // Reset quantity về rỗng nếu hết hàng
            quantity: stockValue === 'Hết hàng' ? '' : prev.quantity
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setProductData(prev => ({
            ...prev,
            images: [...prev.images, ...imageUrls]
        }));
    };

    const removeImage = (index) => {
        setProductData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const toggleColor = (color) => {
        setProductData(prev => ({
            ...prev,
            selectedColor: prev.selectedColor === color ? '' : color
        }));
    };
    
    const toggleSize = (size) => {
        setProductData(prev => ({
            ...prev,
            selectedSize: prev.selectedSize === size ? '' : size
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log(productData);
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <div className="admin-product-details-container">
            <Breadcrumb />
            <h1 className="admin-product-details-title">
                {isEdit ? 'Cập nhật thông tin sản phẩm' : 'Thêm sản phẩm'}
            </h1>
            <form onSubmit={handleSubmit} className="admin-product-details-form">
                <div className="admin-product-details-grid">
                    <div className="admin-product-details-left">
                        <div className="admin-product-details-field">
                            <label>Tiêu đề</label>
                            <input
                                type="text"
                                name="title"
                                value={productData.title}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="admin-product-details-field">
                            <label>Giá</label>
                            <input
                                type="number"
                                name="price"
                                value={productData.price}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="admin-product-details-field">
                            <label>Loại</label>
                            <select
                                name="category"
                                value={productData.category}
                                onChange={handleInputChange}
                                className={`admin-product-details-select ${!productData.category ? 'placeholder' : ''}`}
                                disabled={loading}
                                required
                            >
                                {!productData.category && <option value="" hidden>-- Chọn danh mục --</option>}
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {error && <div className="admin-product-details-error">{error}</div>}
                        </div>
                        <div className="admin-product-details-field">
                            <label>Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={productData.slug}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="admin-product-details-field">
                            <label>Mã sản phẩm</label>
                            <input
                                type="text"
                                name="productCode"
                                value={productData.productCode}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="admin-product-details-field">
                            <label>Mô tả sản phẩm</label>
                            <textarea
                                name="description"
                                value={productData.description}
                                onChange={handleInputChange}
                                rows="4"
                            />
                        </div>
                    </div>
                    <div className="admin-product-details-right">
                        <div className="admin-product-details-field">
                            <label>Tình trạng kho</label>
                            <select
                                name="stock"
                                value={productData.stock}
                                onChange={handleStockChange}
                                className="admin-product-details-select"
                            >
                                <option value="Còn hàng">Còn hàng</option>
                                <option value="Hết hàng">Hết hàng</option>
                            </select>
                        </div>
                        <div className="admin-product-details-field">
                            <label>Số lượng có sẵn</label>
                            <input
                                type="number"
                                name="quantity"
                                value={productData.quantity}
                                onChange={handleInputChange}
                                disabled={productData.stock === 'Hết hàng'}
                                className={productData.stock === 'Hết hàng' ? 'disabled' : ''}
                            />
                        </div>
                        <div className="admin-product-details-field">
                            <label>Hình ảnh</label>
                            <div className="admin-product-details-image-upload">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    id="product-images"
                                    hidden
                                />
                                <label htmlFor="product-images" className="admin-product-details-upload-button">
                                    <span className="admin-product-details-upload-content">
                                        <FaCloudUploadAlt className="admin-product-details-upload-icon" />
                                        <span>Chọn hình ảnh sản phẩm</span>
                                    </span>
                                </label>
                            </div>
                            <div className="admin-product-details-image-preview">
                                {productData.images.map((image, index) => (
                                    <div key={index} className="admin-product-details-image-item">
                                        <img src={image} alt={`Product ${index + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="admin-product-details-image-remove"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="admin-product-details-field">
                            <label>Màu sắc</label>
                            <div className="admin-product-details-colors">
                                {availableColors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`admin-product-details-color-button ${
                                            productData.selectedColor === color ? 'selected' : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => toggleColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="admin-product-details-field">
                            <label>Kích cỡ</label>
                            <div className="admin-product-details-sizes">
                                {availableSizes.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={`admin-product-details-size-button ${
                                            productData.selectedSize === size ? 'selected' : ''
                                        }`}
                                        onClick={() => toggleSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="admin-product-details-actions">
                    <button 
                        type="button" 
                        className="admin-product-details-cancel"
                        onClick={handleCancel}
                    >
                        Hủy
                    </button>
                    <button type="submit" className="admin-product-details-submit">
                        Lưu Sản Phẩm
                    </button>
                </div>
            </form>
        </div>
    );
};
export default AdminProductDetails;