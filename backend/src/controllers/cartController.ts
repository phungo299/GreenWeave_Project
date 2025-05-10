import { Request, Response } from "express";
import mongoose from "mongoose";
import { Cart, Product } from "../models";

// Lấy giỏ hàng của người dùng
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }
    
    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        select: "name price stock variants",
      });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    
    return res.status(200).json(cart);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { productId, variantId, color, quantity } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    }
    
    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    
    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const itemIndex = cart.items.findIndex(
      item => 
        item.productId.toString() === productId && 
        item.variantId === variantId &&
        item.color === color
    );
    
    if (itemIndex > -1) {
      // Cập nhật số lượng nếu sản phẩm đã tồn tại
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Thêm sản phẩm mới vào giỏ hàng
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        variantId: variantId || "",
        color: color || "",
        quantity
      });
    }
    
    // Lưu giỏ hàng
    await cart.save();
    
    // Trả về giỏ hàng đã được cập nhật với thông tin sản phẩm
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price stock variants",
    });
    
    return res.status(200).json(updatedCart);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    const { quantity } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    }
    
    // Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }
    
    // Tìm sản phẩm trong giỏ hàng
    const itemIndex = cart.items.findIndex(item => item._id && item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
    
    // Cập nhật số lượng
    cart.items[itemIndex].quantity = quantity;
    
    // Lưu giỏ hàng
    await cart.save();
    
    // Trả về giỏ hàng đã được cập nhật với thông tin sản phẩm
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price stock variants",
    });
    
    return res.status(200).json(updatedCart);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.itemId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }
    
    // Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }
    
    // Lọc bỏ sản phẩm cần xóa
    cart.items = cart.items.filter(item => item._id && item._id.toString() !== itemId);
    
    // Lưu giỏ hàng
    await cart.save();
    
    // Trả về giỏ hàng đã được cập nhật với thông tin sản phẩm
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price stock variants",
    });
    
    return res.status(200).json(updatedCart);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }
    
    // Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }
    
    // Xóa tất cả sản phẩm
    cart.items = [];
    
    // Lưu giỏ hàng
    await cart.save();
    
    return res.status(200).json({ message: "Đã xóa toàn bộ giỏ hàng", cart });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}; 