import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import ProductCard from '../components/ui/productcard/ProductCard';
import HeroImage from '../components/ui/HeroImage';
import productService from '../services/productService';
import '../assets/css/ProductOverviewPageV2.css';
import AnimatedSection from '../components/common/AnimatedSection';

const PRODUCTS_PER_PAGE = 9;

// Preset animation variants
const smoothZoomIn = {
    hidden: { opacity: 0, scale: 0.92, filter: "blur(2px)" },
    visible: {
        opacity: 1, scale: 1, filter: "blur(0px)",
        transition: { type: "spring", stiffness: 66, damping: 20, mass: 0.9, duration: 1.05 }
    }
};
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
};
const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 18, duration: 0.9 } }
};

const ProductOverviewPage = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Fetch categories and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch categories
                const categoryResponse = await productService.getCategories();
                if (categoryResponse?.categories) {
                    const fetchedCategories = categoryResponse.categories.map(cat => ({
                        id: cat._id,
                        name: cat.name,
                        count: 0 // Will be calculated later
                    }));
                    setCategories([
                        { id: 'all', name: 'Tất cả', count: 0 },
                        ...fetchedCategories
                    ]);
                }
                
                // Fetch products
                const productResponse = await productService.getAll({ limit: 100 });
                if (productResponse?.products) {
                    const formattedProducts = productResponse.products.map(product => {
                        let imageUrl = product.images?.[0] || product.imageUrl || '/assets/images/placeholder.jpg';
                        const stockStatus = product.stock === "Hết hàng" || product.quantity <= 0 ? 'Hết hàng' : 'Còn hàng';
                        
                        return {
                            id: product._id,
                            name: product.name || product.title,
                            description: product.description || 'Sản phẩm bền vững',
                            price: product.price || 0,
                            priceFormatted: `${product.price?.toLocaleString() || 0} đ`,
                            image: imageUrl,
                            category: product.categoryId?._id || 'uncategorized',
                            categoryName: product.categoryId?.name || 'Chưa phân loại',
                            stockStatus: stockStatus,
                            rating: product.rating || 4.5,
                            reviewCount: product.reviewCount || Math.floor(Math.random() * 100) + 10,
                            isNew: new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                            isSale: product.salePrice && product.salePrice < product.price,
                            salePrice: product.salePrice
                        };
                    });
                    
                    setProducts(formattedProducts);
                    
                    // Update category counts
                    setCategories(prev => prev.map(cat => ({
                        ...cat,
                        count: cat.id === 'all' 
                            ? formattedProducts.length 
                            : formattedProducts.filter(p => p.category === cat.id).length
                    })));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                // Nếu là lỗi kết nối hoặc server offline, hiển thị empty store thay vì error
                const isNetworkError = err.code === 'ECONNREFUSED' || 
                                     err.message?.includes('Network Error') || 
                                     err.message?.includes('fetch') ||
                                     err.message?.includes('Failed to fetch') ||
                                     err.name === 'TypeError' ||
                                     !navigator.onLine;
                
                if (isNetworkError) {
                    // Set empty arrays để hiển thị "cửa hàng đang trống"
                    setProducts([]);
                    setCategories([{ id: 'all', name: 'Tất cả', count: 0 }]);
                } else {
                    setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products;
        
        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(product => product.category === activeCategory);
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Sort products
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return b.isNew - a.isNew;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
        
        return sorted;
    }, [products, activeCategory, searchTerm, sortBy]);

    // Visible products based on pagination
    const visibleProducts = useMemo(() => {
        return filteredAndSortedProducts.slice(0, currentPage * PRODUCTS_PER_PAGE);
    }, [filteredAndSortedProducts, currentPage]);

    const hasMoreProducts = visibleProducts.length < filteredAndSortedProducts.length;

    // Load more products
    const loadMoreProducts = useCallback(() => {
        if (!hasMoreProducts || isLoadingMore) return;
        
        setIsLoadingMore(true);
        setTimeout(() => {
            setCurrentPage(prev => prev + 1);
            setIsLoadingMore(false);
        }, 500);
    }, [hasMoreProducts, isLoadingMore]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchTerm, sortBy]);

    const handleProductClick = useCallback((productId) => {
        navigate(`/products/${productId}`);
    }, [navigate]);

    const handleCategoryChange = useCallback((categoryId) => {
        setActiveCategory(categoryId);
    }, []);

    const sortOptions = [
        { value: 'name', label: 'Tên A-Z' },
        { value: 'price-low', label: 'Giá thấp → cao' },
        { value: 'price-high', label: 'Giá cao → thấp' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
        { value: 'newest', label: 'Mới nhất' }
    ];

    if (loading) {
        return (
            <div className="product-overview-v2">
                <Header />
                <div className="loading-container">
                    <div className="loading-spinner-v2"></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-overview-v2">
                <Header />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Thử lại
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="product-overview-v2">
            <Header />
            
            {/* Hero Section */}
            <AnimatedSection variants={fadeIn}>
            <section className="products-hero">
                <div className="hero-background">
                    <HeroImage
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Products Hero"
                        className="hero-bg-img"
                        fallbackSrc="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    />
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content">
                    <div className="container">
                        <AnimatedSection variants={slideUp}>
                        <h1 className="hero-title" id="bosutap">Bộ Sưu Tập</h1>
                        </AnimatedSection>
                        <AnimatedSection variants={fadeIn} delay={0.1}>
                        <h2 className="hero-subtitle">Thời Trang Bền Vững</h2>
                        </AnimatedSection>
                        <AnimatedSection variants={fadeIn} delay={0.2}>
                        <p className="hero-description">
                            Khám phá những sản phẩm thời trang được chế tạo từ vật liệu tái chế, 
                            thân thiện với môi trường và đầy phong cách.
                        </p>
                        </AnimatedSection>
                        <AnimatedSection variants={smoothZoomIn} delay={0.3}>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">{products.length}+</span>
                                <span className="stat-label">Sản phẩm</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Bền vững</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">24/7</span>
                                <span className="stat-label">Hỗ trợ</span>
                            </div>
                        </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>
            </AnimatedSection>

            {/* Filters & Search */}
            <AnimatedSection variants={fadeIn} delay={0.1}>
            <section className="filters-section">
                <div className="container">
                    <div className="filters-header">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        
                        <div className="filter-controls">
                            <div className="view-toggle">
                                <button 
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    ⊞
                                </button>
                                <button 
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    ☰
                                </button>
                            </div>
                            
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-select"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="categories-filter">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(category.id)}
                            >
                                {category.name} ({category.count})
                            </button>
                        ))}
                    </div>
                </div>
            </section>
            </AnimatedSection>

            {/* Products Grid */}
            <AnimatedSection variants={fadeIn} delay={0.2}>
            <section className="products-list-section" style={{paddingBottom: '100px'}}>
                <div className="container">
                    {visibleProducts.length === 0 ? (
                        <AnimatedSection variants={fadeIn}>
                        <div className="empty-products-state">
                            <h3>Hiện chưa có sản phẩm nào phù hợp.</h3>
                            <p>Vui lòng thử lại với bộ lọc khác hoặc quay lại sau.</p>
                        </div>
                        </AnimatedSection>
                    ) : (
                        <div className={`products-grid ${viewMode}`}> 
                            {visibleProducts.map((product, index) => (
                                <AnimatedSection key={product.id} variants={smoothZoomIn} delay={0.05 * index}>
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    description={product.description}
                                    price={product.price}
                                    image={product.image}
                                    onClick={() => handleProductClick(product.id)}
                                />
                                </AnimatedSection>
                            ))}
                        </div>
                    )}
                    {hasMoreProducts && (
                        <div className="load-more-container">
                            <button className="load-more-btn" onClick={loadMoreProducts} disabled={isLoadingMore}>
                                {isLoadingMore ? 'Đang tải...' : 'Xem thêm'}
                            </button>
                        </div>
                    )}
                </div>
            </section>
            </AnimatedSection>
            <Footer />
        </div>
    );
    
};

export default ProductOverviewPage;