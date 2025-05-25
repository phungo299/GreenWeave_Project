import { Request, Response } from "express";
import Setting from "../models/Setting";

// Lấy tất cả settings (Admin only)
export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    
    // Xây dựng query
    const query: any = {};
    if (category) {
      query.category = category;
    }
    
    // Xác định hướng sắp xếp
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    const settings = await Setting.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Setting.countDocuments(query);
    
    return res.status(200).json({
      settings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get all settings error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi lấy danh sách cài đặt" 
    });
  }
};

// Lấy setting theo key
export const getSettingByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const setting = await Setting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ 
        message: "Không tìm thấy cài đặt" 
      });
    }
    
    return res.status(200).json(setting);
  } catch (error: any) {
    console.error("Get setting by key error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi lấy cài đặt" 
    });
  }
};

// Lấy settings public (không cần auth)
export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    
    const query: any = { isPublic: true };
    if (category) {
      query.category = category;
    }
    
    const settings = await Setting.find(query).select("key value type category description");
    
    // Convert to key-value object for easier frontend usage
    const settingsObject: any = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = {
        value: setting.value,
        type: setting.type,
        category: setting.category,
        description: setting.description
      };
    });
    
    return res.status(200).json(settingsObject);
  } catch (error: any) {
    console.error("Get public settings error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi lấy cài đặt công khai" 
    });
  }
};

// Tạo setting mới (Admin only)
export const createSetting = async (req: Request, res: Response) => {
  try {
    const { key, value, type, description, category, isPublic } = req.body;
    
    if (!key || value === undefined || !type) {
      return res.status(400).json({ 
        message: "Key, value và type là bắt buộc" 
      });
    }
    
    // Check if setting already exists
    const existingSetting = await Setting.findOne({ key });
    if (existingSetting) {
      return res.status(400).json({ 
        message: "Cài đặt với key này đã tồn tại" 
      });
    }
    
    const newSetting = new Setting({
      key: key.trim(),
      value,
      type,
      description: description || "",
      category: category || "general",
      isPublic: isPublic || false
    });
    
    const savedSetting = await newSetting.save();
    
    return res.status(201).json({
      message: "Tạo cài đặt thành công",
      data: savedSetting
    });
  } catch (error: any) {
    console.error("Create setting error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi tạo cài đặt" 
    });
  }
};

// Cập nhật setting (Admin only)
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, type, description, category, isPublic } = req.body;
    
    const setting = await Setting.findOne({ key });
    if (!setting) {
      return res.status(404).json({ 
        message: "Không tìm thấy cài đặt" 
      });
    }
    
    // Update fields
    if (value !== undefined) setting.value = value;
    if (type) setting.type = type;
    if (description !== undefined) setting.description = description;
    if (category) setting.category = category;
    if (typeof isPublic === 'boolean') setting.isPublic = isPublic;
    
    const updatedSetting = await setting.save();
    
    return res.status(200).json({
      message: "Cập nhật cài đặt thành công",
      data: updatedSetting
    });
  } catch (error: any) {
    console.error("Update setting error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi cập nhật cài đặt" 
    });
  }
};

// Xóa setting (Admin only)
export const deleteSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const deletedSetting = await Setting.findOneAndDelete({ key });
    
    if (!deletedSetting) {
      return res.status(404).json({ 
        message: "Không tìm thấy cài đặt" 
      });
    }
    
    return res.status(200).json({ 
      message: "Xóa cài đặt thành công" 
    });
  } catch (error: any) {
    console.error("Delete setting error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi xóa cài đặt" 
    });
  }
};

// Lấy danh sách categories
export const getSettingCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Setting.distinct("category");
    
    return res.status(200).json({ categories });
  } catch (error: any) {
    console.error("Get setting categories error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi lấy danh sách categories" 
    });
  }
}; 