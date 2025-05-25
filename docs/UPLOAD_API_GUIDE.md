# UPLOAD API GUIDE

## Tổng quan
Hướng dẫn sử dụng Upload API để upload hình ảnh lên Cloudinary thông qua backend.

## Cấu hình

### Backend Environment Variables
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Dependencies
```bash
npm install multer cloudinary @types/multer
```

## API Endpoints

### 1. Upload Image - `/api/upload/image`
**Method:** POST  
**Auth:** Required  
**Content-Type:** multipart/form-data

**Request:**
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'general'); // optional
formData.append('width', '800'); // optional
formData.append('height', '600'); // optional
formData.append('quality', 'auto'); // optional
formData.append('format', 'webp'); // optional

const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "message": "Upload thành công",
  "data": {
    "public_id": "general/abc123",
    "secure_url": "https://res.cloudinary.com/...",
    "url": "http://res.cloudinary.com/...",
    "width": 800,
    "height": 600,
    "format": "webp",
    "bytes": 45678,
    "folder": "general"
  }
}
```

### 2. Upload Avatar - `/api/upload/avatar`
**Method:** POST  
**Auth:** Required  
**Content-Type:** multipart/form-data

**Request:**
```javascript
const formData = new FormData();
formData.append('file', avatarFile);

const response = await fetch('/api/upload/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Features:**
- Tự động resize về 400x400px
- Crop theo face detection
- Format webp
- Lưu trong folder 'avatars'

### 3. Upload Product Image - `/api/upload/product-image`
**Method:** POST  
**Auth:** Required  
**Content-Type:** multipart/form-data

**Features:**
- Tự động resize về 800x800px
- Format webp
- Lưu trong folder 'products'

### 4. Upload Multiple Images - `/api/upload/multiple-images`
**Method:** POST  
**Auth:** Required  
**Content-Type:** multipart/form-data

**Request:**
```javascript
const formData = new FormData();
files.forEach(file => {
  formData.append('files', file);
});
formData.append('folder', 'gallery');
formData.append('width', '1024');
formData.append('height', '768');

const response = await fetch('/api/upload/multiple-images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "message": "Upload thành công 3/5 hình ảnh",
  "data": {
    "successful": [
      {
        "public_id": "gallery/img1",
        "secure_url": "https://...",
        "width": 1024,
        "height": 768,
        "format": "webp",
        "bytes": 123456,
        "folder": "gallery"
      }
    ],
    "failed": ["Error message for failed uploads"],
    "total": 5,
    "successCount": 3,
    "failCount": 2
  }
}
```

### 5. Delete Image - `/api/upload/delete-image`
**Method:** DELETE  
**Auth:** Required  
**Content-Type:** application/json

**Request:**
```javascript
const response = await fetch('/api/upload/delete-image', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    publicId: 'general/abc123'
  })
});
```

## Frontend Integration

### CloudinaryService Usage
```javascript
import { cloudinaryService } from '../services/cloudinaryService';

// Upload avatar
try {
  const result = await cloudinaryService.uploadAvatar(file);
  console.log('Avatar uploaded:', result.data.secure_url);
} catch (error) {
  console.error('Upload failed:', error);
}

// Upload product image
try {
  const result = await cloudinaryService.uploadProductImage(file);
  console.log('Product image uploaded:', result.data.secure_url);
} catch (error) {
  console.error('Upload failed:', error);
}

// Upload multiple images
try {
  const result = await cloudinaryService.uploadMultipleImages(files, 'gallery');
  console.log(`Uploaded ${result.successCount}/${result.total} images`);
} catch (error) {
  console.error('Upload failed:', error);
}

// Delete image
try {
  await cloudinaryService.deleteImage('general/abc123');
  console.log('Image deleted successfully');
} catch (error) {
  console.error('Delete failed:', error);
}
```

### React Component Example
```jsx
import React, { useState } from 'react';
import { cloudinaryService } from '../services/cloudinaryService';

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await cloudinaryService.uploadImage(file, 'uploads');
      setImageUrl(result.data.secure_url);
      window.toast?.success('Upload thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      window.toast?.error('Upload thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Đang upload...</p>}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Uploaded" 
          style={{ maxWidth: '300px', height: 'auto' }}
        />
      )}
    </div>
  );
};

export default ImageUploader;
```

## Error Handling

### Common Errors
1. **401 Unauthorized**: Token không hợp lệ hoặc thiếu
2. **400 Bad Request**: File không hợp lệ hoặc thiếu
3. **413 Payload Too Large**: File quá lớn (>10MB)
4. **500 Internal Server Error**: Lỗi Cloudinary hoặc server

### Error Response Format
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Frontend Error Handling
```javascript
try {
  const result = await cloudinaryService.uploadAvatar(file);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 413) {
    window.toast?.error('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB');
  } else {
    window.toast?.error('Upload thất bại! Vui lòng thử lại');
  }
}
```

## File Size Limits

| Endpoint | Max Size | Recommended |
|----------|----------|-------------|
| `/upload/image` | 10MB | 2-5MB |
| `/upload/avatar` | 5MB | 1-2MB |
| `/upload/product-image` | 8MB | 2-4MB |
| `/upload/multiple-images` | 10MB per file | 2-5MB per file |

## Supported Formats

**Input:** JPG, JPEG, PNG, GIF, WEBP, BMP, TIFF  
**Output:** WEBP (default), JPG, PNG

## Cloudinary Transformations

### Automatic Optimizations
- **Avatar**: 400x400px, face detection crop, webp format
- **Product**: 800x800px, fill crop, webp format
- **General**: Custom size, auto quality, webp format

### URL Transformations
```javascript
// Get thumbnail
const thumbnailUrl = cloudinaryService.getThumbnailUrl(publicId, 150);

// Get responsive image
const responsiveUrl = cloudinaryService.getResponsiveUrl(publicId, 'lg');

// Custom transformation
const customUrl = cloudinaryService.getTransformedUrl(publicId, {
  width: 500,
  height: 300,
  crop: 'fill',
  quality: 'auto',
  format: 'webp'
});
```

## Security

### Authentication
- Tất cả upload endpoints yêu cầu JWT token
- Token được gửi trong header: `Authorization: Bearer <token>`

### File Validation
- Chỉ chấp nhận file hình ảnh
- Kiểm tra MIME type
- Giới hạn kích thước file
- Scan malware (có thể implement)

### Access Control
- User chỉ có thể upload file cho chính mình
- Admin có thể upload mọi loại file
- Public ID được generate tự động để tránh conflict

## Monitoring & Logging

### Server Logs
```javascript
console.log('Upload request:', {
  userId: req.user.id,
  fileName: req.file.originalname,
  fileSize: req.file.size,
  folder: req.body.folder
});
```

### Error Tracking
```javascript
console.error('Upload error:', {
  error: error.message,
  userId: req.user.id,
  fileName: req.file?.originalname
});
```

## Best Practices

### Frontend
1. **Validate file trước khi upload**
2. **Show progress indicator**
3. **Handle errors gracefully**
4. **Compress images trước khi upload**
5. **Use lazy loading cho images**

### Backend
1. **Validate file type và size**
2. **Generate unique public_id**
3. **Log upload activities**
4. **Implement rate limiting**
5. **Clean up failed uploads**

### Cloudinary
1. **Use auto quality**
2. **Enable auto format**
3. **Set up delivery optimization**
4. **Monitor usage và costs**
5. **Backup important images**

## Troubleshooting

### Common Issues

1. **Upload fails with 404**
   - Check if backend server is running
   - Verify API endpoint URL
   - Check authentication token

2. **Cloudinary 401 error**
   - Verify Cloudinary credentials in .env
   - Check API key permissions
   - Ensure cloud name is correct

3. **File too large error**
   - Check file size limits
   - Compress image before upload
   - Verify multer configuration

4. **CORS errors**
   - Check CORS configuration in backend
   - Verify allowed origins
   - Check request headers

### Debug Steps
1. Check browser network tab
2. Verify backend logs
3. Test with Postman/curl
4. Check Cloudinary dashboard
5. Verify environment variables

**Trạng thái: ✅ Upload API đã được implement và document đầy đủ** 