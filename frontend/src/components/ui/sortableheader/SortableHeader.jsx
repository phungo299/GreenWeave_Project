import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './SortableHeader.css';

const SortableHeader = ({
    label,
    sortState = 'none', // 'asc', 'desc', 'none'
    onSort,
    className = '',
    ...props
}) => {
    let icon = <FaSort />;
    if (sortState === 'asc') icon = <FaSortUp />;
    if (sortState === 'desc') icon = <FaSortDown />;

    return (
        <span
            className={`gw-sortable-header ${className}`}
            onClick={onSort}
            {...props}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
            {label}
            <span className="gw-sortable-header-icon" style={{ marginLeft: 4 }}>{icon}</span>
        </span>
    );
};
export default SortableHeader;