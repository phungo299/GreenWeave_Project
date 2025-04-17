import React from 'react';
import './ProductCard.css';

/**
 * ProductCard component for displaying product information
 * @param {Object} props
 * @param {string} props.id - Product ID
 * @param {string} props.name - Product name
 * @param {string} props.description - Product description
 * @param {string} props.price - Product price
 * @param {string} props.image - Product image source
 * @param {string} props.imageClass - Additional image class names
 * @param {Function} props.onClick - Click handler for the card button
 */
const ProductCard = ({ 
    id, 
    name, 
    description, 
    price, 
    image, 
    imageClass = '', 
    onClick 
}) => {
    const handleButtonClick = (e) => {
        e.stopPropagation();
        if (onClick) onClick(id);
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img 
                    src={image} 
                    alt={name} 
                    className={`product-image ${imageClass}`} 
                />
            </div>
            <div className="product-info">
                <h3 className="product-name">{name}</h3>
                <p className="product-description">{description}</p>
                <p className="product-price">{price}</p>
            </div>
            <button className="product-button" onClick={handleButtonClick}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </button>
        </div>
    );
};
export default ProductCard; 