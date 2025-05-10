import { Request, Response } from "express";
import { Category } from "../models";

// Lấy tất cả danh mục
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết một danh mục theo ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    return res.status(200).json(category);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Tạo danh mục mới
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
    }

    const newCategory = new Category({
      name,
      description: description || "",
      imageUrl: imageUrl || "",
    });

    const savedCategory = await newCategory.save();
    return res.status(201).json(savedCategory);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, imageUrl },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    return res.status(200).json(updatedCategory);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Xóa danh mục
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    
    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    return res.status(200).json({ message: "Đã xóa danh mục thành công" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}; 