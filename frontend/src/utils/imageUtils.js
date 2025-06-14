import cloudinaryService from '../services/cloudinaryService';

/**
 * Utility functions for image handling
 */
export const imageUtils = {
    /**
     * Get optimized image URL from various sources
     * @param {string|Object} imageSource - Can be URL, public_id, or image object
     * @param {Object} options - Transformation options
     */
    getOptimizedUrl: (imageSource, options = {}) => {
        if (!imageSource) return null;

        // If it's already a full URL, return as is
        if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
            return imageSource;
        }

        // If it's a Cloudinary public_id
        if (typeof imageSource === 'string') {
            return cloudinaryService.getTransformedUrl(imageSource, {
                width: 400,
                height: 400,
                crop: 'fill',
                quality: 'auto',
                format: 'webp',
                ...options
            });
        }

        // If it's an image object with public_id
        if (typeof imageSource === 'object' && imageSource.public_id) {
            return cloudinaryService.getTransformedUrl(imageSource.public_id, {
                width: 400,
                height: 400,
                crop: 'fill',
                quality: 'auto',
                format: 'webp',
                ...options
            });
        }

        // If it's an image object with url
        if (typeof imageSource === 'object' && imageSource.url) {
            return imageSource.url;
        }

        return null;
    },

    /**
     * Get avatar URL with default fallback
     * @param {string|Object} avatar - Avatar source
     * @param {number} size - Size of avatar (default: 150)
     */
    getAvatarUrl: (avatar, size = 150) => {
        return imageUtils.getOptimizedUrl(avatar, {
            width: size,
            height: size,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            format: 'webp'
        });
    },

    /**
     * Get product image URL
     * @param {string|Object} image - Image source
     * @param {string} size - Size preset (thumbnail, small, medium, large)
     */
    getProductImageUrl: (image, size = 'medium') => {
        const sizePresets = {
            thumbnail: { width: 150, height: 150 },
            small: { width: 300, height: 300 },
            medium: { width: 500, height: 500 },
            large: { width: 800, height: 800 }
        };

        const preset = sizePresets[size] || sizePresets.medium;

        return imageUtils.getOptimizedUrl(image, {
            ...preset,
            crop: 'fill',
            quality: 'auto',
            format: 'webp'
        });
    },

    /**
     * Get responsive image URLs for different breakpoints
     * @param {string|Object} image - Image source
     */
    getResponsiveUrls: (image) => {
        if (!image) return {};

        const publicId = typeof image === 'string' ? image : image.public_id;
        if (!publicId) return {};

        return {
            xs: cloudinaryService.getResponsiveUrl(publicId, 'xs'),
            sm: cloudinaryService.getResponsiveUrl(publicId, 'sm'),
            md: cloudinaryService.getResponsiveUrl(publicId, 'md'),
            lg: cloudinaryService.getResponsiveUrl(publicId, 'lg'),
            xl: cloudinaryService.getResponsiveUrl(publicId, 'xl')
        };
    },

    /**
     * Generate srcSet for responsive images
     * @param {string|Object} image - Image source
     */
    generateSrcSet: (image) => {
        const urls = imageUtils.getResponsiveUrls(image);
        if (!Object.keys(urls).length) return '';

        return [
            `${urls.xs} 320w`,
            `${urls.sm} 640w`,
            `${urls.md} 768w`,
            `${urls.lg} 1024w`,
            `${urls.xl} 1280w`
        ].filter(Boolean).join(', ');
    },

    /**
     * Validate image file
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     */
    validateImageFile: (file, options = {}) => {
        const {
            maxSize = 10, // MB
            allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            minWidth = 0,
            minHeight = 0
        } = options;

        const errors = [];

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            errors.push(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`);
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            errors.push(`Kích thước file không được vượt quá ${maxSize}MB`);
        }

        // Check image dimensions (if required)
        if (minWidth > 0 || minHeight > 0) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    if (img.width < minWidth) {
                        errors.push(`Chiều rộng tối thiểu: ${minWidth}px`);
                    }
                    if (img.height < minHeight) {
                        errors.push(`Chiều cao tối thiểu: ${minHeight}px`);
                    }
                    resolve({ isValid: errors.length === 0, errors });
                };
                img.onerror = () => {
                    errors.push('File không phải là hình ảnh hợp lệ');
                    resolve({ isValid: false, errors });
                };
                img.src = URL.createObjectURL(file);
            });
        }

        return { isValid: errors.length === 0, errors };
    },

    /**
     * Create image preview URL
     * @param {File} file - Image file
     */
    createPreviewUrl: (file) => {
        if (!file || !file.type.startsWith('image/')) return null;
        return URL.createObjectURL(file);
    },

    /**
     * Cleanup preview URL
     * @param {string} url - Preview URL to cleanup
     */
    cleanupPreviewUrl: (url) => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    },

    /**
     * Get image placeholder based on type (using base64 data URI to avoid external dependencies)
     * @param {string} type - Type of placeholder (avatar, product, general)
     * @param {Object} options - Options for placeholder
     */
    getPlaceholder: (type = 'general', options = {}) => {
        const { width = 80, height = 80 } = options;
        
        // Create SVG-based placeholder as base64 data URI
        const createSvgPlaceholder = (bgColor, textColor, text, w = width, h = height) => {
            const svg = `
                <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="${bgColor}"/>
                    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(w, h) * 0.15}" 
                          fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
                </svg>
            `.trim();
            
            // Dùng URL encoding thay vì base64 để support tiếng Việt  
            const encodedSvg = encodeURIComponent(svg);
            return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
        };
        
        const placeholders = {
            avatar: createSvgPlaceholder('#e8f5f0', '#134d35', 'Avatar', width, height),
            product: createSvgPlaceholder('#f5f5f5', '#666666', 'Sản phẩm', width, height),
            general: createSvgPlaceholder('#f0f0f0', '#999999', 'Hình ảnh', width, height)
        };

        return placeholders[type] || placeholders.general;
    },

    /**
     * Extract public_id from Cloudinary URL
     * @param {string} url - Cloudinary URL
     */
    extractPublicId: (url) => {
        if (!url || !url.includes('cloudinary.com')) return null;
        
        const matches = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/i);
        return matches ? matches[1] : null;
    },

    /**
     * Check if image is from Cloudinary
     * @param {string} url - Image URL
     */
    isCloudinaryImage: (url) => {
        return url && url.includes('cloudinary.com');
    }
};

export default imageUtils; 