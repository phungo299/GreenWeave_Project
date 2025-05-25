import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import imageUtils from '../../../utils/imageUtils';
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
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(id);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setIsError(true);
        setImageLoaded(true);
    };

    return (
        <Link to={`/products/${id}`} className="product-card-link">
            <div className="product-card">
                <div className="product-image-container">
                    {!imageLoaded && <div className="product-image-placeholder"></div>}
                    {isError ? (
                        <div className="product-image-error">Không thể tải hình ảnh</div>
                    ) : (
                        <img 
                            src={
                                imageUtils.getProductImageUrl(image, 'medium') || 
                                imageUtils.getPlaceholder('product', { width: 400, height: 400 })
                            } 
                            alt={name} 
                            className={`product-image ${imageClass} ${imageLoaded ? 'loaded' : 'loading'}`}
                            loading="lazy"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    )}
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
        </Link>
    );
};
export default memo(ProductCard);