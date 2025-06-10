import { Request, Response } from "express";
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
import multer from "multer";
import { AuthRequest } from "../types/auth";

// Parse Cloudinary URL from environment
const parseCloudinaryUrl = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
  
  if (!cloudinaryUrl) {
    console.error('CLOUDINARY_URL not found in environment variables');
    return {
      cloud_name: '',
      api_key: '',
      api_secret: ''
    };
  }
  
  try {
    // Handle both cloudinary:// and https:// URL formats
    if (cloudinaryUrl.startsWith('cloudinary://')) {
      const url = new URL(cloudinaryUrl);
      return {
        cloud_name: url.hostname,
        api_key: url.username,
        api_secret: url.password
      };
    } else {
      // Fallback for manual config format
      const parts = cloudinaryUrl.split(',');
      const config: any = {};
      parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) config[key.trim()] = value.trim();
      });
      return {
        cloud_name: config.cloud_name || '',
        api_key: config.api_key || '',
        api_secret: config.api_secret || ''
      };
    }
  } catch (error) {
    console.error('Invalid CLOUDINARY_URL format:', error);
    return {
      cloud_name: '',
      api_key: '',
      api_secret: ''
    };
  }
};

// Configure Cloudinary with enhanced error handling
const cloudinaryConfig = parseCloudinaryUrl();

// Validate configuration
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.warn('Cloudinary configuration incomplete. Please check CLOUDINARY_URL environment variable.');
  console.warn('Expected format: cloudinary://api_key:api_secret@cloud_name');
}

cloudinary.config(cloudinaryConfig);

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload single image
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn file hình ảnh"
      });
    }

    const { folder = 'general', width, height, quality = 'auto', format = 'webp' } = req.body;

    // Prepare upload options
    const uploadOptions: UploadApiOptions = {
      folder: folder,
      resource_type: 'image' as const,
      quality: quality,
      format: format
    };

    // Add transformation if width and height provided
    if (width && height) {
      uploadOptions.transformation = [{
        width: parseInt(width),
        height: parseInt(height),
        crop: 'fill',
        gravity: 'center'
      }];
    }

    // Upload to Cloudinary
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      ).end(req.file!.buffer);
    });

    return res.status(200).json({
      success: true,
      message: "Upload thành công",
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        folder: result.folder
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi upload hình ảnh",
      error: error.message
    });
  }
};

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn file avatar"
      });
    }

    const uploadOptions: UploadApiOptions = {
      folder: 'avatars',
      resource_type: 'image' as const,
      transformation: [{
        width: 400,
        height: 400,
        crop: 'fill'
      }],
      quality: 'auto',
      format: 'webp'
    };

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      ).end(req.file!.buffer);
    });

    return res.status(200).json({
      success: true,
      message: "Upload avatar thành công",
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        folder: result.folder
      }
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi upload avatar",
      error: error.message
    });
  }
};

// Upload product image
export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn file hình ảnh sản phẩm"
      });
    }

    const uploadOptions: UploadApiOptions = {
      folder: 'products',
      resource_type: 'image' as const,
      transformation: [{
        width: 800,
        height: 800,
        crop: 'fill'
      }],
      quality: 'auto',
      format: 'webp'
    };

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      ).end(req.file!.buffer);
    });

    return res.status(200).json({
      success: true,
      message: "Upload hình ảnh sản phẩm thành công",
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        folder: result.folder
      }
    });
  } catch (error: any) {
    console.error('Product image upload error:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi upload hình ảnh sản phẩm",
      error: error.message
    });
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một file hình ảnh"
      });
    }

    const { folder = 'general' } = req.body;
    const files = req.files as Express.Multer.File[];

    const uploadPromises = files.map(file => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image' as const,
            quality: 'auto',
            format: 'webp'
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Upload failed'));
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.allSettled(uploadPromises);
    
    const successful = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<UploadApiResponse>).value);
      
    const failed = results
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason);

    return res.status(200).json({
      success: true,
      message: `Upload thành công ${successful.length}/${files.length} file`,
      data: {
        successful: successful.map(result => ({
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          folder: result.folder
        })),
        failed: failed.map(error => error.message),
        total: files.length,
        successCount: successful.length,
        failCount: failed.length
      }
    });
  } catch (error: any) {
    console.error('Multiple upload error:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi upload nhiều hình ảnh",
      error: error.message
    });
  }
};

// Delete image
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp public_id của hình ảnh"
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({
      success: true,
      message: "Xóa hình ảnh thành công",
      data: result
    });
  } catch (error: any) {
    console.error('Delete image error:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa hình ảnh",
      error: error.message
    });
  }
};

// Export multer middleware
export const uploadMiddleware = {
  single: upload.single('file'),
  multiple: upload.array('files', 10)
}; 