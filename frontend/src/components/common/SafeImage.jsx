import React, { useState, useRef } from 'react';
import imageUtils from '../../utils/imageUtils';

/**
 * SafeImage component với error handling tốt hơn để tránh infinite loop
 */
const SafeImage = ({ 
    src, 
    alt = 'Hình ảnh', 
    className = '', 
    width = 80, 
    height = 80,
    placeholderType = 'product',
    ...props 
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef(null);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setIsLoading(false);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    // Nếu đã error hoặc không có src, hiển thị placeholder
    if (hasError || !src) {
        return (
            <img
                ref={imgRef}
                src={imageUtils.getPlaceholder(placeholderType, { width, height })}
                alt={alt}
                className={className}
                style={{ opacity: isLoading ? 0.5 : 1 }}
                {...props}
            />
        );
    }

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={className}
            onError={handleError}
            onLoad={handleLoad}
            style={{ opacity: isLoading ? 0.5 : 1 }}
            {...props}
        />
    );
};

export default SafeImage; 