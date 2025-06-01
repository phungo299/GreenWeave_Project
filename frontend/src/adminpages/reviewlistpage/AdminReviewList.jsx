import React, { useState, useEffect, useCallback } from 'react';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import ReviewDetailModal from '../../components/ui/reviewdetailmodal/ReviewDetailModal';
import { FaEye, FaTrashAlt } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import './AdminReviewList.css';

const AdminReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    
    // Modal states
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const PAGE_SIZE = 10;

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);          
            const params = {
                page,
                limit: PAGE_SIZE,
                sortBy: sortField,
                sortOrder
            };
            const response = await reviewService.getAllReviews(params);           
            if (response && response.success) {
                setReviews(response.reviews || []);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalReviews(response.pagination?.total || 0);
            } else {
                throw new Error('Không thể tải danh sách đánh giá');
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err.message || 'Đã xảy ra lỗi khi tải danh sách đánh giá');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [page, sortField, sortOrder]);

    const searchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);           
            const params = {
                keyword: search.trim(),
                page,
                limit: PAGE_SIZE,
                sortBy: sortField,
                sortOrder
            };
            const response = await reviewService.searchReviews(params);            
            if (response && response.success) {
                setReviews(response.reviews || []);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalReviews(response.pagination?.total || 0);
            } else {
                throw new Error('Không thể tìm kiếm đánh giá');
            }
        } catch (err) {
            console.error('Error searching reviews:', err);
            setError(err.message || 'Đã xảy ra lỗi khi tìm kiếm đánh giá');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [search, page, sortField, sortOrder]);

    // Load reviews when component mounts or when sort/page changes
    useEffect(() => {
        if (!isSearching) {
            fetchReviews();
        }
    }, [page, sortField, sortOrder, isSearching, fetchReviews]);

    // Search reviews when search term changes
    useEffect(() => {
        if (search.trim()) {
            setIsSearching(true);
            searchReviews();
        } else {
            setIsSearching(false);
            setPage(1);
        }
    }, [search, searchReviews]);

    // Search with debounce when search params change
    useEffect(() => {
        if (isSearching) {
            const timeoutId = setTimeout(() => {
                searchReviews();
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [page, sortField, sortOrder, search, isSearching, searchReviews]);

    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field) {
            if (sortOrder === 'asc') nextOrder = 'desc';
            else if (sortOrder === 'desc') nextOrder = 'asc';
        }
        setSortField(field);
        setSortOrder(nextOrder);
        setPage(1); // Reset to first page when sorting
    };

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1); // Reset to first page when searching
    };

    const handleViewReview = async (reviewId) => {
        try {
            setModalLoading(true);
            setIsModalOpen(true);
            setSelectedReview(null);            
            const response = await reviewService.getReviewById(reviewId);            
            if (response && response.success) {
                setSelectedReview(response.review);
            } else {
                throw new Error('Không thể tải thông tin đánh giá');
            }
        } catch (err) {
            console.error('Error fetching review details:', err);
            alert(err.message || 'Đã xảy ra lỗi khi tải thông tin đánh giá');
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReview(null);
        setModalLoading(false);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            return;
        }
        try {
            setLoading(true);
            await reviewService.deleteReview(reviewId);           
            // Refresh the current view
            if (isSearching && search.trim()) {
                await searchReviews();
            } else {
                await fetchReviews();
            }           
            alert('Xóa đánh giá thành công!');
        } catch (err) {
            console.error('Error deleting review:', err);
            alert(err.message || 'Đã xảy ra lỗi khi xóa đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateComment = (comment, maxLength = 100) => {
        if (!comment) return 'Không có nhận xét';
        if (comment.length <= maxLength) return `"${comment}"`;
        return `"${comment.substring(0, maxLength)}..."`;
    };

    return (
        <div className="admin-review-list-container">
            <AdminBreadcrumb />
            <div className="admin-review-list-content">
                <div className="admin-review-list-header-row">
                    <h1 className="admin-review-list-title">
                        Đánh Giá ({totalReviews})
                    </h1>
                    <SearchBar
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Tìm kiếm theo tên người dùng, email, tên sản phẩm..."
                        className="admin-review-list-search-box"
                    />
                </div>
                {error && (
                    <div className="admin-review-list-error">
                        <p>❌ {error}</p>
                        <button 
                            onClick={() => isSearching ? searchReviews() : fetchReviews()}
                            className="admin-review-list-retry-btn"
                        >
                            Thử lại
                        </button>
                    </div>
                )}
                <div className="admin-review-list-table-wrapper">
                    <table className="admin-review-list-table">
                        <thead>
                            <tr>
                                <th>
                                    <SortableHeader
                                        label="Người dùng"
                                        sortState={sortField === 'userId.username' ? sortOrder : 'none'}
                                        onSort={() => handleSort('userId.username')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Tên sản phẩm"
                                        sortState={sortField === 'productId.name' ? sortOrder : 'none'}
                                        onSort={() => handleSort('productId.name')}
                                    />
                                </th>
                                <th>Nhận xét</th>
                                <th>
                                    <SortableHeader
                                        label="Ngày tạo"
                                        sortState={sortField === 'createdAt' ? sortOrder : 'none'}
                                        onSort={() => handleSort('createdAt')}
                                    />
                                </th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="admin-review-list-loading">
                                        <div className="admin-review-list-spinner">⏳</div>
                                        <p>Đang tải đánh giá...</p>
                                    </td>
                                </tr>
                            ) : reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <tr key={review._id} className="admin-review-list-row">
                                        <td>
                                            <div className="admin-review-list-user-info">
                                                <div className="admin-review-list-name">
                                                    {review.userId?.username || 'N/A'}
                                                </div>
                                                {review.userId?.fullName && (
                                                    <div className="admin-review-list-fullname">
                                                        ({review.userId.fullName})
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-review-list-product">
                                                <div className="admin-review-list-product-name">
                                                    {review.productId?.name || 'N/A'}
                                                </div>
                                                {review.productId?.productCode && (
                                                    <div className="admin-review-list-product-code">
                                                        #{review.productId.productCode}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-review-list-comment">
                                                {truncateComment(review.comment)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-review-list-date">
                                                {formatDate(review.createdAt)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-review-list-actions">
                                                <button 
                                                    className="admin-review-list-view-btn"
                                                    onClick={() => handleViewReview(review._id)}
                                                    disabled={loading}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button 
                                                    className="admin-review-list-delete-btn"
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    disabled={loading}
                                                    title="Xóa đánh giá"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="admin-review-list-empty">
                                        <p>
                                            {search.trim() 
                                                ? `Không tìm thấy đánh giá nào với từ khóa "${search}"` 
                                                : 'Chưa có đánh giá nào'
                                            }
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        className="admin-review-list-pagination"
                    />
                )}
            </div>
            {/* Review Detail Modal */}
            <ReviewDetailModal
                review={selectedReview}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                loading={modalLoading}
            />
        </div>
    );
};
export default AdminReviewList;