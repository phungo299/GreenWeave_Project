import React, { useState } from 'react';
import AdminBreadcrumb from '../../components/ui/adminbreadcrumb/AdminBreadcrumb';
import SearchBar from '../../components/ui/searchbar/SearchBar';
import SortableHeader from '../../components/ui/sortableheader/SortableHeader';
import Pagination from '../../components/ui/pagination/Pagination';
import './AdminReviewList.css';

const MOCK_REVIEWS = [
    {
        id: 1,
        name: 'Trần Minh Hiếu',
        email: 'brooklyn.simmons@gmail.com',
        color: '#C9D8CD',
        review: 'Áo túi xinh lắm, chất vải tái chế mà vẫn rất mềm và thoải mái. Cảm thấy mình đang góp phần nhỏ bảo vệ môi trường nữa!',
    },
    {
        id: 2,
        name: 'Trần Thảo Vy',
        email: 'brooklyn.simmons@gmail.com',
        color: '#C9D8CD',
        review: 'Ý tưởng độc đáo, mặc đi chơi ai cũng hỏi mua ở đâu. Mình rất thích vì sản phẩm vừa đẹp vừa có thông điệp.',
    },
    {
        id: 3,
        name: 'Nguyễn Thiên Kim',
        email: 'brooklyn.simmons@gmail.com',
        color: '#F6A96B',
        review: 'Sản phẩm chất lượng hơn mong đợi. Mình ủng hộ những dự án sáng tạo như thế này!',
    },
    {
        id: 4,
        name: 'Doãn Hải My',
        email: 'brooklyn.simmons@gmail.com',
        color: '#5B7CB2',
        review: 'Áo chắc chắn, đường may tỉ mỉ. Nhận hàng thấy có tag ghi rõ nguồn gốc tái chế, cảm thấy rất có trách nhiệm với thiên nhiên.',
    },
];

const PAGE_SIZE = 10;

const AdminReviewList = () => {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('none');
    const [page, setPage] = useState(1);

    const sortFunctions = {
        id: (a, b, order) => order === 'asc' ? a.id - b.id : b.id - a.id,
        name: (a, b, order) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
        email: (a, b, order) => order === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email),
    };
    
    const handleSort = (field) => {
        let nextOrder = 'asc';
        if (sortField === field && sortOrder === 'asc') nextOrder = 'desc';
        else if (sortField === field && sortOrder === 'desc') nextOrder = 'none';
        setSortField(nextOrder === 'none' ? '' : field);
        setSortOrder(nextOrder);
    };

    const filteredReviews = MOCK_REVIEWS.filter(
        (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.email.toLowerCase().includes(search.toLowerCase())
    );
    
    let sortedReviews = [...filteredReviews];
    if (sortField && sortOrder !== 'none') {
        sortedReviews.sort((a, b) => sortFunctions[sortField](a, b, sortOrder));
    }
    const paginatedReviews = sortedReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    
    const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE);

    return (
        <div className="admin-review-list-container">
            <AdminBreadcrumb />
            <div className="admin-review-list-content">
                <div className="admin-review-list-header-row">
                    <h1 className="admin-review-list-title">Đánh Giá</h1>
                    <SearchBar
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Tìm đánh giá"
                    />
                </div>
                <div className="admin-review-list-table-wrapper">
                    <table className="admin-review-list-table">
                        <thead>
                            <tr>
                                <th>
                                    <SortableHeader
                                        label="ID"
                                        sortState={sortField === 'id' ? sortOrder : 'none'}
                                        onSort={() => handleSort('id')}
                                    />
                                </th>
                                <th></th>
                                <th className="admin-review-list-sortable">
                                    <SortableHeader
                                        label="Họ và tên"
                                        sortState={sortField === 'name' ? sortOrder : 'none'}
                                        onSort={() => handleSort('name')}
                                    />
                                </th>
                                <th>
                                    <SortableHeader
                                        label="Email"
                                        sortState={sortField === 'email' ? sortOrder : 'none'}
                                        onSort={() => handleSort('email')}
                                    />
                                </th>
                                <th>Đánh giá</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReviews.map((review) => (
                                <tr key={review.id} className="admin-review-list-row">
                                    <td>{review.id}</td>
                                    <td>
                                        <div
                                            className="admin-review-list-avatar"
                                            style={{ background: review.color }}
                                        />
                                    </td>
                                    <td>
                                        <div className="admin-review-list-name">{review.name}</div>
                                    </td>
                                    <td>
                                        <div className="admin-review-list-email">{review.email}</div>
                                    </td>
                                    <td>
                                        <div className="admin-review-list-review">{`"${review.review}"`}</div>
                                    </td>
                                    <td>
                                        <button className="admin-review-list-delete-btn">Xóa</button>
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
                    className="admin-review-list-pagination"
                />
            </div>
        </div>
    );
};
export default AdminReviewList;