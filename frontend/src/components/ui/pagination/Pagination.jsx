import React from 'react';
import './Pagination.css';
import { FaEllipsisH } from 'react-icons/fa';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}) => {
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                i === currentPage ||
                i === currentPage - 1 ||
                i === currentPage + 1
            ) {
                pages.push(
                    <button
                        key={i}
                        className={`pagination-btn${currentPage === i ? ' active' : ''}`}
                        onClick={() => onPageChange(i)}
                    >
                        {i}
                    </button>
                );
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pages.push(
                    <span key={i} className="pagination-ellipsis">
                        <FaEllipsisH />
                    </span>
                );
            }
        }
        return pages;
    };
    if (totalPages <= 1) return null;
    return (
        <div className={`pagination-container ${className}`}>
            <button
                className="pagination-btn"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
            >
                {'<'}
            </button>
            {renderPagination()}
            <button
                className="pagination-btn"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                {'>'}
            </button>
        </div>
    );
};
export default Pagination;