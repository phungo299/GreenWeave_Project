import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    className = '',
    style = {},
    inputClassName = '',
    ...props
}) => (
    <div className={`gw-searchbar-container ${className}`} style={style}>
        <FaSearch className="gw-searchbar-icon" />
        <input
            type="text"
            className={`gw-searchbar-input ${inputClassName}`}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
        />
    </div>
);
export default SearchBar;