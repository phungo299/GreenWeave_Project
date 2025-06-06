import React, { useState } from 'react';

const HeroImage = ({ src, alt, className, fallbackSrc, ...props }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Default fallback images
    const defaultFallbacks = [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        '/assets/images/hero-fallback.jpg'
    ];

    const handleImageLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        if (!hasError) {
            const nextFallback = fallbackSrc || defaultFallbacks[0];
            setImageSrc(nextFallback);
            setHasError(true);
        }
    };

    return (
        <div className="hero-image-wrapper" style={{ position: 'relative' }}>
            {isLoading && (
                <div 
                    className="image-loading-placeholder"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                        backgroundSize: '20px 20px',
                        animation: 'shimmer 1.5s infinite',
                        borderRadius: 'inherit'
                    }}
                />
            )}
            <img
                src={imageSrc}
                alt={alt}
                className={className}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                    ...props.style
                }}
                {...props}
            />
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -20px 0; }
                    100% { background-position: 20px 0; }
                }
            `}</style>
        </div>
    );
};

export default HeroImage; 