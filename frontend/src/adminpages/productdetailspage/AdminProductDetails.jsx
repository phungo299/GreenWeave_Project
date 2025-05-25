import React, { useState, useEffect } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import './AdminProductDetails.css';
import Breadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import productService from '../../services/productService';

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
                const response = await productService.getCategories({
                    page: 1,
                    limit: 100 // Get a large number to avoid pagination
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

    // Add useEffect to get product information when component mounts in edit case
    useEffect(() => {
        // Only fetch data when in edit mode (with id)
        if (isEdit && id) {
            const fetchProductDetails = async () => {
                try {
                    setLoading(true);
                    const response = await productService.getById(id);   
                    //console.log("Product details response:", response);            
                    if (response && response.data) {
                        const product = response.data;                  
                        // Update state with product data
                        setProductData({
                            title: product.title || product.name || '',
                            price: product.price?.toString() || '',
                            stock: product.stock || 'Còn hàng',
                            quantity: product.quantity?.toString() || '',
                            category: product.categoryId?._id || '',
                            slug: product.slug || '',
                            productCode: product.productCode || '',
                            description: product.description || '',
                            images: product.images || [],
                            selectedColor: product.selectedColor || '',
                            selectedSize: product.selectedSize || ''
                        });
                    } else {
                        setError('Không thể tải thông tin sản phẩm');
                    }
                } catch (err) {
                    console.error('Error fetching product details:', err);
                    setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProductDetails();
        }
    }, [id, isEdit]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();    
        try {
            // Check required data
            if (!productData.title || !productData.category || !productData.price || !productData.slug || !productData.productCode) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc: Tên sản phẩm, danh mục, giá, slug và mã sản phẩm');
                return;
            }
            //console.log("Selected category ID:", productData.category);
            //console.log("Available categories:", categories);
            // Prepare data to send to API
            const formattedData = {
                name: productData.title,
                title: productData.title,
                description: productData.description || "",
                price: Number(productData.price),
                stock: productData.stock,
                quantity: productData.stock === 'Hết hàng' ? 0 : Number(productData.quantity),
                category: categories.find(cat => cat._id === productData.category)?.name || "",
                categoryId: productData.category,
                slug: productData.slug,
                productCode: productData.productCode,
                images: productData.images.length > 0 
                    ? productData.images.map(img => img.toString()) 
                    : [],
                selectedColor: productData.selectedColor,
                selectedSize: productData.selectedSize,
                variants: [
                    {
                        variantId: "string",
                        color: "string",
                        imageUrl: "string",
                        stock: 0
                    }
                ],
                isFeature: false
            }; 
            setLoading(true);
            let response;          
            // Call appropriate API based on isEdit state
            if (isEdit) {
                // PUT to update product
                response = await productService.update(id, formattedData);
                if (response && response.success) {
                    alert('Cập nhật sản phẩm thành công!');
                    navigate('/admin/products');
                } else {
                    alert('Cập nhật sản phẩm thất bại: ' + (response?.message || 'Lỗi không xác định'));
                }
            } else {
                // POST to create new product
                response = await productService.create(formattedData);
                if (response && response.success) {
                    alert('Thêm sản phẩm thành công!');
                    navigate('/admin/products');
                } else {
                    alert('Thêm sản phẩm thất bại: ' + (response?.message || 'Lỗi không xác định'));
                }
            }
        } catch (err) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} product:`, err);
            alert(`Không thể ${isEdit ? 'cập nhật' : 'tạo'} sản phẩm. Vui lòng thử lại sau: ` + 
                (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
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
                                required
                            />
                        </div>
                        <div className="admin-product-details-field">
                            <label>Giá</label>
                            <input
                                type="number"
                                name="price"
                                value={productData.price}
                                onChange={handleInputChange}
                                required
                                min="0"
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
                                    <option key={category._id} value={category._id}>
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
                                required={productData.stock !== 'Hết hàng'}
                                min="0"
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
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        className="admin-product-details-submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default AdminProductDetails;