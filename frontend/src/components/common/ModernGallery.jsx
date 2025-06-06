import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../assets/css/ModernAnimations.css';

/**
 * Modern Gallery Component - Thay thế cho flipGallery.js
 * Sử dụng CSS hiện đại thay vì JavaScript animations phức tạp
 */
const ModernGallery = ({ 
  images = [], 
  autoplay = true, 
  autoplayDelay = 5000,
  showNavigation = true,
  className = '',
  onImageChange,
  ...props 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const intervalRef = useRef(null);
  const galleryRef = useRef(null);

  // Preload images với modern approach
  const preloadImages = useCallback(async () => {
    try {
      const imagePromises = images.map(img => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          
          // Sử dụng loading="eager" equivalent
          image.loading = 'eager';
          image.decoding = 'sync';
          
          image.onload = () => resolve(img);
          image.onerror = () => reject(`Failed to load: ${img.url}`);
          
          // Modern cache busting nếu cần
          const url = new URL(img.url);
          if (img.bustCache) {
            url.searchParams.set('t', Date.now());
          }
          
          image.src = url.toString();
        });
      });

      await Promise.allSettled(imagePromises);
      setImagesLoaded(true);
    } catch (error) {
      console.warn('Some images failed to load:', error);
      setHasError(true);
      setImagesLoaded(true);
    }
  }, [images]);

  // Auto rotation với proper cleanup
  const startAutoplay = useCallback(() => {
    if (!autoplay || images.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, autoplayDelay);
  }, [autoplay, autoplayDelay, images.length]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Navigation handlers
  const goToImage = useCallback((index) => {
    if (index < 0 || index >= images.length) return;
    
    setCurrentIndex(index);
    onImageChange?.(images[index], index);
    
    // Restart autoplay khi user tương tác
    if (autoplay) {
      stopAutoplay();
      startAutoplay();
    }
  }, [images, onImageChange, autoplay, stopAutoplay, startAutoplay]);

  const goToNext = useCallback(() => {
    goToImage((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, goToImage]);

  const goToPrev = useCallback(() => {
    goToImage(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, goToImage]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
      case 'Home':
        event.preventDefault();
        goToImage(0);
        break;
      case 'End':
        event.preventDefault();
        goToImage(images.length - 1);
        break;
      default:
        break;
    }
  }, [goToPrev, goToNext, goToImage, images.length]);

  // Effects
  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    if (imagesLoaded && !hasError) {
      startAutoplay();
    }
    
    return stopAutoplay;
  }, [imagesLoaded, hasError, startAutoplay, stopAutoplay]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    gallery.addEventListener('keydown', handleKeyDown);
    return () => gallery.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Pause autoplay on hover
  const handleMouseEnter = useCallback(() => {
    stopAutoplay();
  }, [stopAutoplay]);

  const handleMouseLeave = useCallback(() => {
    if (autoplay) startAutoplay();
  }, [autoplay, startAutoplay]);

  // Loading state
  if (!imagesLoaded) {
    return (
      <div className={`modern-gallery ${className}`} {...props}>
        <div className="modern-shimmer" style={{ height: '300px' }}>
          <div className="loading-placeholder">
            <div className="modern-spinner"></div>
            <p>Đang tải hình ảnh...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error fallback
  if (hasError || images.length === 0) {
    return (
      <div className={`modern-gallery ${className}`} {...props}>
        <div className="gallery-error" style={{ 
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p>Không thể tải hình ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={galleryRef}
      className={`modern-gallery ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
      role="region"
      aria-label="Image gallery"
      aria-live="polite"
      {...props}
    >
      {/* Gallery Container */}
      <div className="modern-gallery-container" style={{ height: '300px', position: 'relative' }}>
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className={`modern-gallery-item ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `url("${image.url}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            aria-hidden={index !== currentIndex}
          >
            {/* Image title overlay */}
            {image.title && index === currentIndex && (
              <div className="gallery-title-overlay modern-fade-in" style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {image.title}
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        {showNavigation && images.length > 1 && (
          <>
            <button
              className="gallery-nav-prev modern-button"
              onClick={goToPrev}
              aria-label="Previous image"
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2
              }}
            >
              ←
            </button>
            
            <button
              className="gallery-nav-next modern-button"
              onClick={goToNext}
              aria-label="Next image"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2
              }}
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Navigation Dots */}
      {showNavigation && images.length > 1 && (
        <div className="modern-gallery-nav" role="tablist" aria-label="Gallery navigation">
          {images.map((_, index) => (
            <button
              key={index}
              className={`${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToImage(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to image ${index + 1}`}
              aria-controls={`gallery-item-${index}`}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default ModernGallery; 