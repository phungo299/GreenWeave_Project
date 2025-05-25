import { Request, Response } from "express";
import { Category } from "../models";
import Product from '../models/Product';

// Lấy tất cả danh mục
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách danh mục'
    });
  }
};

// Tìm kiếm categories
export const searchCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const q = req.query.q as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const skip = (page - 1) * limit;

    let query = {};
    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Category.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error searching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tìm kiếm danh mục'
    });
  }
};

// Lấy chi tiết một danh mục theo ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin danh mục'
    });
  }
};

// Tạo danh mục mới
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;

    // Kiểm tra tên danh mục đã tồn tại
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      });
    }

    const category = new Category({
      name,
      description,
      imageUrl
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo danh mục'
    });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    // Kiểm tra tên danh mục đã tồn tại (trừ chính nó)
    if (name) {
      const existingCategory = await Category.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Tên danh mục đã tồn tại'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, imageUrl },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật danh mục'
    });
  }
};

// Xóa danh mục
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const productsCount = await Product.countDocuments({ categoryId: id });
    if (productsCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Không thể xóa danh mục vì còn sản phẩm thuộc danh mục này'
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa danh mục'
    });
  }
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Kiểm tra danh mục có tồn tại không
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    const [products, total] = await Promise.all([
      Product.find({ categoryId: id })
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ categoryId: id })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      products,
      category,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy sản phẩm theo danh mục'
    });
  }
}; 