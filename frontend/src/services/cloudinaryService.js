import axiosClient from '../api/axiosClient';
// import API_CONFIG from '../config/api';

// Parse Cloudinary URL from environment
const parseCloudinaryUrl = () => {
    const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL || '';   
    // Fallback values từ docsNGHIÊM CẤM FALLBACK VÌ BỊ LEAK API KEY
    const fallbackConfig = {
        cloudName: '',
        apiKey: '',
        apiSecret: ''
    };
    
    if (!cloudinaryUrl) {
        console.warn('REACT_APP_CLOUDINARY_URL not found, using fallback config');
        return fallbackConfig;
    }
    
    try {
        const url = new URL(cloudinaryUrl);
        return {
            cloudName: url.hostname,
            apiKey: url.username,
            apiSecret: url.password
        };
    } catch (error) {
        console.warn('Invalid CLOUDINARY_URL format, using fallback config:', error);
        return fallbackConfig;
    }
};

// Cloudinary configuration
const cloudinaryConfig = parseCloudinaryUrl();
const CLOUDINARY_CONFIG = {
    cloudName: cloudinaryConfig.cloudName,
    apiKey: cloudinaryConfig.apiKey,
    apiSecret: cloudinaryConfig.apiSecret,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default', // Sử dụng preset từ env hoặc mặc định
    baseUrl: `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}`
};


const cloudinaryService = {
    /**
     * Upload trực tiếp lên Cloudinary (fallback khi backend không có API)
     * @param {File} file - File hình ảnh cần upload
     * @param {string} folder - Thư mục lưu trữ trên Cloudinary
     * @param {Object} options - Các tùy chọn upload
     */
    uploadDirectToCloudinary: async (file, folder = 'general', options = {}) => {
        try {
            // Validate file
            if (!file) {
                throw new Error('Vui lòng chọn file hình ảnh');
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('File phải là hình ảnh (jpg, png, gif, webp)');
            }

            // Validate file size (max 10MB)
            const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error(`Kích thước file không được vượt quá ${maxSize / (1024 * 1024)}MB`);
            }

            // Create FormData for Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            
            // Try unsigned upload first, fallback to signed if needed
            if (CLOUDINARY_CONFIG.uploadPreset && CLOUDINARY_CONFIG.uploadPreset !== 'ml_default') {
                formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            } else {
                // Nếu không có preset hoặc dùng ml_default, thử một số preset phổ biến
                const commonPresets = ['ml_default', 'unsigned_preset', 'default'];
                formData.append('upload_preset', commonPresets[0]);
            }
            
            if (folder) {
                formData.append('folder', folder);
            }
            
            // Add transformation parameters
            if (options.width && options.height) {
                formData.append('transformation', `w_${options.width},h_${options.height},c_fill`);
            }
            if (options.quality) {
                formData.append('quality', options.quality);
            }

            // Upload directly to Cloudinary
            let response = await fetch(`${CLOUDINARY_CONFIG.baseUrl}/image/upload`, {
                method: 'POST',
                body: formData
            });

            // If unsigned upload fails, try signed upload
            if (!response.ok) {
                if (response.status === 400 || response.status === 401) {
                    console.warn(`Unsigned upload failed (${response.status}), trying signed upload`);
                    try {
                        return await cloudinaryService.uploadSigned(file, folder, options);
                    } catch (signedError) {
                        console.warn('Signed upload also failed, using base64 fallback');
                        throw new Error('Both Cloudinary upload methods failed');
                    }
                } else {
                    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
                }
            }

            const result = await response.json();
            
            // Return in same format as backend API
            return {
                data: {
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                    url: result.url,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes,
                    folder: result.folder
                },
                message: 'Upload thành công'
            };
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error(error.message || 'Không thể upload hình ảnh');
        }
    },

    /**
     * Upload hình ảnh lên Cloudinary (với fallback)
     * @param {File} file - File hình ảnh cần upload
     * @param {string} folder - Thư mục lưu trữ trên Cloudinary (optional)
     * @param {Object} options - Các tùy chọn upload (optional)
     */
    uploadImage: async (file, folder = 'general', options = {}) => {
        try {
            // Validate file
            if (!file) {
                throw new Error('Vui lòng chọn file hình ảnh');
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('File phải là hình ảnh (jpg, png, gif, webp)');
            }

            // Validate file size (max 10MB)
            const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error(`Kích thước file không được vượt quá ${maxSize / (1024 * 1024)}MB`);
            }

            try {
                // Try backend API first
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);
                
                // Add optional parameters
                if (options.width) formData.append('width', options.width);
                if (options.height) formData.append('height', options.height);
                if (options.quality) formData.append('quality', options.quality);
                if (options.format) formData.append('format', options.format);

                // Upload to server (server will handle Cloudinary upload)
                const response = await axiosClient.post('/upload/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000, // 30 seconds for image upload
                });

                return response;
            } catch (backendError) {
                // If backend API fails (404), try direct Cloudinary upload
                console.warn('Backend upload API not available, trying direct Cloudinary upload');
                try {
                    return await cloudinaryService.uploadDirectToCloudinary(file, folder, options);
                } catch (cloudinaryError) {
                    // If Cloudinary also fails, use base64 fallback
                    console.warn('Cloudinary upload failed, using base64 fallback');
                    return await cloudinaryService.uploadAsBase64(file, options);
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    /**
     * Upload avatar của user
     * @param {File} file - File avatar
     */
    uploadAvatar: async (file) => {
        try {
            // Try backend avatar API first
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosClient.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
            });

            return response;
        } catch (backendError) {
            console.warn('Backend avatar upload API not available, trying fallback');
            return await cloudinaryService.uploadImage(file, 'avatars', {
                width: 400,
                height: 400,
                quality: 'auto',
                format: 'webp',
                maxSize: 5 * 1024 * 1024 // 5MB max for avatar
            });
        }
    },

    /**
     * Upload hình ảnh sản phẩm
     * @param {File} file - File hình ảnh sản phẩm
     */
    uploadProductImage: async (file) => {
        try {
            return await cloudinaryService.uploadImage(file, 'products', {
                width: 800,
                height: 800,
                quality: 'auto',
                format: 'webp',
                maxSize: 8 * 1024 * 1024 // 8MB max for product images
            });
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload multiple hình ảnh
     * @param {FileList|Array} files - Danh sách files
     * @param {string} folder - Thư mục lưu trữ
     * @param {Object} options - Tùy chọn upload
     */
    uploadMultipleImages: async (files, folder = 'general', options = {}) => {
        try {
            // Limit concurrent uploads to prevent overwhelming the server
            const batchSize = 3; // Upload max 3 files at a time
            const fileArray = Array.from(files);
            const results = [];
            
            for (let i = 0; i < fileArray.length; i += batchSize) {
                const batch = fileArray.slice(i, i + batchSize);
                const uploadPromises = batch.map(file => 
                    cloudinaryService.uploadImage(file, folder, options)
                );
                
                const batchResults = await Promise.allSettled(uploadPromises);
                results.push(...batchResults);
                
                // Small delay between batches to prevent rate limiting
                if (i + batchSize < fileArray.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            const successful = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
                
            const failed = results
                .filter(result => result.status === 'rejected')
                .map(result => result.reason?.message || 'Upload failed');

            return {
                successful,
                failed,
                total: files.length,
                successCount: successful.length,
                failCount: failed.length
            };
        } catch (error) {
            console.error('Error in uploadMultipleImages:', error);
            throw error;
        }
    },

    /**
     * Xóa hình ảnh từ Cloudinary
     * @param {string} publicId - Public ID của hình ảnh trên Cloudinary
     */
    deleteImage: async (publicId) => {
        try {
            const response = await axiosClient.delete('/upload/delete-image', {
                data: { publicId }
            });
            return response;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    },

    /**
     * Tạo URL với transformation
     * @param {string} publicId - Public ID của hình ảnh
     * @param {Object} transformations - Các transformation cần áp dụng
     */
    getTransformedUrl: (publicId, transformations = {}) => {
        if (!publicId) return null;

        // Handle local base64 images
        if (publicId.startsWith('local_')) {
            const base64Data = localStorage.getItem(`avatar_${publicId}`);
            return base64Data || null;
        }

        // Handle data URLs (base64)
        if (publicId.startsWith('data:')) {
            return publicId;
        }

        const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
        let transformString = '';

        // Build transformation string
        const transforms = [];
        if (transformations.width) transforms.push(`w_${transformations.width}`);
        if (transformations.height) transforms.push(`h_${transformations.height}`);
        if (transformations.crop) transforms.push(`c_${transformations.crop}`);
        if (transformations.quality) transforms.push(`q_${transformations.quality}`);
        if (transformations.format) transforms.push(`f_${transformations.format}`);
        if (transformations.gravity) transforms.push(`g_${transformations.gravity}`);

        if (transforms.length > 0) {
            transformString = transforms.join(',') + '/';
        }

        return `${baseUrl}/${transformString}${publicId}`;
    },

    /**
     * Tạo URL thumbnail
     * @param {string} publicId - Public ID của hình ảnh
     * @param {number} size - Kích thước thumbnail (default: 150)
     */
    getThumbnailUrl: (publicId, size = 150) => {
        return cloudinaryService.getTransformedUrl(publicId, {
            width: size,
            height: size,
            crop: 'fill',
            quality: 'auto',
            format: 'webp'
        });
    },

    /**
     * Tạo URL responsive
     * @param {string} publicId - Public ID của hình ảnh
     * @param {string} breakpoint - Breakpoint (sm, md, lg, xl)
     */
    getResponsiveUrl: (publicId, breakpoint = 'md') => {
        const sizes = {
            xs: { width: 320, quality: 'auto' },
            sm: { width: 640, quality: 'auto' },
            md: { width: 768, quality: 'auto' },
            lg: { width: 1024, quality: 'auto' },
            xl: { width: 1280, quality: 'auto' }
        };

        const size = sizes[breakpoint] || sizes.md;
        return cloudinaryService.getTransformedUrl(publicId, {
            ...size,
            format: 'webp',
            crop: 'scale'
        });
    },

    /**
     * Fallback: Convert image to base64 và lưu local (khi cả backend và Cloudinary đều fail)
     * @param {File} file - File hình ảnh
     * @param {Object} options - Tùy chọn
     */
    uploadAsBase64: async (file, options = {}) => {
        try {
            // Validate file
            if (!file) {
                throw new Error('Vui lòng chọn file hình ảnh');
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('File phải là hình ảnh (jpg, png, gif, webp)');
            }

            // Validate file size (max 2MB for base64)
            const maxSize = options.maxSize || 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                throw new Error(`Kích thước file không được vượt quá ${maxSize / (1024 * 1024)}MB cho base64`);
            }

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const base64 = e.target.result;
                    const publicId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    // Store in localStorage for persistence
                    try {
                        localStorage.setItem(`avatar_${publicId}`, base64);
                        
                        resolve({
                            data: {
                                public_id: publicId,
                                secure_url: base64,
                                url: base64,
                                width: 'unknown',
                                height: 'unknown',
                                format: file.type.split('/')[1],
                                bytes: file.size,
                                folder: 'local'
                            },
                            message: 'Upload thành công (lưu local)'
                        });
                    } catch (storageError) {
                        reject(new Error('Không thể lưu ảnh vào localStorage'));
                    }
                };
                
                reader.onerror = () => {
                    reject(new Error('Không thể đọc file'));
                };
                
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Error converting to base64:', error);
            throw error;
        }
    },

    /**
     * Tạo signature cho signed upload (khi unsigned preset không hoạt động)
     * @param {Object} params - Parameters cần sign
     */
    generateSignature: (params) => {
        // Note: Trong production, signature nên được tạo từ backend để bảo mật API secret
        // Đây chỉ là demo, không nên expose API secret ở frontend
        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign = {
            timestamp,
            ...params
        };
        
        // Sort parameters
        const sortedParams = Object.keys(paramsToSign)
            .sort()
            .map(key => `${key}=${paramsToSign[key]}`)
            .join('&');
            
        // In real app, this should be done on backend
        // For demo purposes only - DO NOT use API secret in frontend in production
        const stringToSign = sortedParams + CLOUDINARY_CONFIG.apiSecret;
        
        // Simple hash function (in real app, use proper SHA1)
        // This is just for demo - use backend for signature generation
        return {
            signature: btoa(stringToSign).substring(0, 20), // Simplified signature
            timestamp,
            api_key: CLOUDINARY_CONFIG.apiKey
        };
    },

    /**
     * Upload với signed request (fallback khi unsigned không hoạt động)
     * @param {File} file - File hình ảnh
     * @param {string} folder - Thư mục
     * @param {Object} options - Tùy chọn
     */
    uploadSigned: async (file, folder = 'general', options = {}) => {
        try {
            const uploadParams = {
                folder: folder,
                resource_type: 'image'
            };
            
            if (options.width && options.height) {
                uploadParams.transformation = `w_${options.width},h_${options.height},c_fill`;
            }
            
            const signatureData = cloudinaryService.generateSignature(uploadParams);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', signatureData.api_key);
            formData.append('timestamp', signatureData.timestamp);
            formData.append('signature', signatureData.signature);
            
            Object.keys(uploadParams).forEach(key => {
                formData.append(key, uploadParams[key]);
            });
            
            const response = await fetch(`${CLOUDINARY_CONFIG.baseUrl}/image/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Signed upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            return {
                data: {
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                    url: result.url,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes,
                    folder: result.folder
                },
                message: 'Upload thành công (signed)'
            };
        } catch (error) {
            console.error('Error with signed upload:', error);
            throw error;
        }
    },
};

export default cloudinaryService; 