import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import cloudinaryService from '../../../services/cloudinaryService';
import './ImageUpload.css';

const ImageUpload = ({
    value = null,
    onChange,
    onUpload,
    folder = 'general',
    multiple = false,
    maxFiles = 5,
    maxSize = 10, // MB
    width,
    height,
    quality = 'auto',
    format = 'webp',
    className = '',
    placeholder = 'Chọn hình ảnh',
    showPreview = true,
    showThumbnails = true,
    disabled = false,
    accept = 'image/*'
}) => {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState(multiple ? (value || []) : (value ? [value] : []));
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setError(null);

        // Validate files
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setError('Chỉ chấp nhận file hình ảnh');
                return;
            }
            if (file.size > maxSize * 1024 * 1024) {
                setError(`Kích thước file không được vượt quá ${maxSize}MB`);
                return;
            }
        }

        // Check max files limit for multiple upload
        if (multiple && previews.length + files.length > maxFiles) {
            setError(`Chỉ được tải lên tối đa ${maxFiles} hình ảnh`);
            return;
        }

        try {
            setUploading(true);

            if (multiple) {
                // Upload multiple files
                const uploadOptions = {
                    width,
                    height,
                    quality,
                    format,
                    maxSize: maxSize * 1024 * 1024
                };

                const result = await cloudinaryService.uploadMultipleImages(files, folder, uploadOptions);
                
                if (result.successful.length > 0) {
                    const newImages = result.successful.map(response => ({
                        public_id: response.data.public_id,
                        url: cloudinaryService.getTransformedUrl(response.data.public_id, {
                            width: width || 400,
                            height: height || 400,
                            crop: 'fill',
                            quality,
                            format
                        }),
                        original_url: response.data.secure_url
                    }));

                    const updatedPreviews = [...previews, ...newImages];
                    setPreviews(updatedPreviews);
                    
                    if (onChange) {
                        onChange(updatedPreviews);
                    }
                    if (onUpload) {
                        onUpload(result.successful);
                    }
                }

                if (result.failed.length > 0) {
                    setError(`${result.failed.length} hình ảnh tải lên thất bại`);
                }
            } else {
                // Upload single file
                const file = files[0];
                const uploadOptions = {
                    width,
                    height,
                    quality,
                    format,
                    maxSize: maxSize * 1024 * 1024
                };

                const response = await cloudinaryService.uploadImage(file, folder, uploadOptions);
                
                if (response && response.data) {
                    const imageData = {
                        public_id: response.data.public_id,
                        url: cloudinaryService.getTransformedUrl(response.data.public_id, {
                            width: width || 400,
                            height: height || 400,
                            crop: 'fill',
                            quality,
                            format
                        }),
                        original_url: response.data.secure_url
                    };

                    setPreviews([imageData]);
                    
                    if (onChange) {
                        onChange(imageData);
                    }
                    if (onUpload) {
                        onUpload(response);
                    }
                }
            }
        } catch (err) {
            console.error('Error uploading images:', err);
            setError(err.message || 'Không thể tải lên hình ảnh');
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle remove image
    const handleRemoveImage = async (index) => {
        try {
            const imageToRemove = previews[index];
            
            // Delete from Cloudinary if it has public_id
            if (imageToRemove.public_id) {
                await cloudinaryService.deleteImage(imageToRemove.public_id);
            }

            const updatedPreviews = previews.filter((_, i) => i !== index);
            setPreviews(updatedPreviews);
            
            if (onChange) {
                onChange(multiple ? updatedPreviews : (updatedPreviews[0] || null));
            }
        } catch (err) {
            console.error('Error removing image:', err);
            setError('Không thể xóa hình ảnh');
        }
    };

    // Handle click upload area
    const handleUploadClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className={`image-upload-container ${className}`}>
            {/* Upload Area */}
            <div 
                className={`image-upload-area ${uploading ? 'uploading' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={handleUploadClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="image-upload-input"
                    disabled={disabled || uploading}
                />
                
                {uploading ? (
                    <div className="image-upload-loading">
                        <div className="loading-spinner"></div>
                        <span>Đang tải lên...</span>
                    </div>
                ) : (
                    <div className="image-upload-content">
                        <FaUpload className="image-upload-icon" />
                        <span className="image-upload-text">{placeholder}</span>
                        <span className="image-upload-hint">
                            {multiple ? `Tối đa ${maxFiles} hình ảnh, ` : ''}
                            Kích thước tối đa {maxSize}MB
                        </span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="image-upload-error">
                    <span>{error}</span>
                </div>
            )}

            {/* Preview Area */}
            {showPreview && previews.length > 0 && (
                <div className="image-upload-previews">
                    {previews.map((image, index) => (
                        <div key={index} className="image-upload-preview">
                            <img 
                                src={showThumbnails ? 
                                    cloudinaryService.getThumbnailUrl(image.public_id, 150) : 
                                    image.url
                                } 
                                alt={`Preview ${index + 1}`}
                                className="image-upload-preview-img"
                            />
                            <button
                                type="button"
                                className="image-upload-remove-btn"
                                onClick={() => handleRemoveImage(index)}
                                disabled={uploading}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUpload; 