import { Request, Response } from "express";
import mongoose from "mongoose";
import { Product } from "../models";

// Lấy tất cả sản phẩm với phân trang và bộ lọc
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const categoryId = req.query.categoryId as string;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
    const isFeatured = req.query.featured === "true";
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    
    // Xây dựng query
    let query: any = {};
    
    // Lọc theo danh mục
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    
    // Lọc theo khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    
    // Lọc sản phẩm nổi bật
    if (req.query.featured !== undefined) {
      query.isFeatured = isFeatured;
    }
    
    // Xác định hướng sắp xếp
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    // Thực thi truy vấn với phân trang
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name");
    
    // Đếm tổng số sản phẩm theo bộ lọc
    const total = await Product.countDocuments(query);
    
    return res.status(200).json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm sản phẩm nâng cao
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Lấy các tham số lọc
    const categoryId = req.query.categoryId as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const color = req.query.color as string;
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    const isFeatured = req.query.featured === "true";
    
    // Xây dựng query dựa trên tham số tìm kiếm
    const searchQuery: any = {};
    
    // Tìm kiếm văn bản
    if (query) {
      // Nếu có text index, sử dụng tìm kiếm theo text
      if (await hasTextIndex()) {
        searchQuery.$text = { $search: query };
      } else {
        // Nếu không có text index, sử dụng regex
        searchQuery.$or = [
          { name: { $regex: query, $options: "i" } },
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { productCode: { $regex: query, $options: "i" } }
        ];
      }
    }
    
    // Lọc theo danh mục
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      searchQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    
    // Lọc theo khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
      searchQuery.price = {};
      if (minPrice !== undefined) searchQuery.price.$gte = minPrice;
      if (maxPrice !== undefined) searchQuery.price.$lte = maxPrice;
    }
    
    // Lọc theo đánh giá
    if (minRating !== undefined) {
      searchQuery.rating = { $gte: minRating };
    }
    
    // Lọc sản phẩm nổi bật
    if (req.query.featured !== undefined) {
      searchQuery.isFeatured = isFeatured;
    }
    
    // Lọc theo màu sắc (trong variants)
    if (color) {
      searchQuery["variants.color"] = { $regex: color, $options: "i" };
    }
    
    // Xác định hướng sắp xếp
    const sort: any = {};
    
    // Xử lý các trường sắp xếp đặc biệt
    switch (sortBy) {
      case "price_asc":
        sort.price = 1;
        break;
      case "price_desc":
        sort.price = -1;
        break;
      case "rating":
        sort.rating = -1;
        break;
      case "popularity":
        sort.reviewCount = -1;
        break;
      case "newest":
        sort.createdAt = -1;
        break;
      default:
        // Mặc định sắp xếp theo thời gian tạo giảm dần
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }
    
    // Thực hiện tìm kiếm với bộ lọc, sắp xếp và phân trang
    const products = await Product.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name");
    
    // Đếm tổng số kết quả
    const total = await Product.countDocuments(searchQuery);
    
    // Thêm thông tin meta
    const filters = {
      query: query || undefined,
      categoryId: categoryId || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      color: color || undefined,
      featured: req.query.featured !== undefined ? isFeatured : undefined,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc"
    };
    
    return res.status(200).json({
      products,
      filters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Kiểm tra xem có chỉ mục text hay không
async function hasTextIndex() {
  const collection = Product.collection;
  const indexes = await collection.indexes();
  return indexes.some(index => index.textIndexVersion);
}

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name");
      
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy sản phẩm" 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error getting product:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Tạo sản phẩm mới
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { 
      categoryId, 
      name,
      title,
      description, 
      price, 
      stock,
      quantity,
      category,
      slug,
      productCode,
      images,
      selectedColor,
      selectedSize,
      variants, 
      isFeatured 
    } = req.body;
    
    if (!name || !categoryId || price === undefined || !slug || !productCode) {
      return res.status(400).json({ 
        message: "Tên sản phẩm, danh mục, giá, slug và mã sản phẩm là bắt buộc" 
      });
    }
    
    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    // Kiểm tra slug và productCode đã tồn tại
    const existingProduct = await Product.findOne({
      $or: [
        { slug },
        { productCode }
      ]
    });

    if (existingProduct) {
      return res.status(400).json({ 
        message: "Slug hoặc mã sản phẩm đã tồn tại" 
      });
    }
    
    const newProduct = new Product({
      categoryId,
      name,
      title: title || "",
      description: description || "",
      price,
      stock: stock || "Còn hàng",
      quantity: quantity || 0,
      category: category || "",
      slug,
      productCode,
      images: images || [],
      selectedColor: selectedColor || "",
      selectedSize: selectedSize || "",
      variants: variants || [],
      isFeatured: isFeatured || false,
      priceHistory: [{ price, updatedAt: new Date() }]
    });
    
    const savedProduct = await newProduct.save();
    await savedProduct.populate("categoryId", "name");
    
    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: savedProduct
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { 
      categoryId, 
      name,
      title,
      description, 
      price, 
      stock,
      quantity,
      category,
      slug,
      productCode,
      images,
      selectedColor,
      selectedSize,
      variants, 
      isFeatured 
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy sản phẩm" 
      });
    }
    
    // Validate categoryId if provided
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID danh mục không hợp lệ" 
      });
    }

    // Kiểm tra slug và productCode đã tồn tại (trừ chính nó)
    if (slug || productCode) {
      const existingProduct = await Product.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(slug ? [{ slug }] : []),
          ...(productCode ? [{ productCode }] : [])
        ]
      });

      if (existingProduct) {
        return res.status(400).json({ 
          success: false,
          message: "Slug hoặc mã sản phẩm đã tồn tại" 
        });
      }
    }
    
    // Cập nhật lịch sử giá nếu giá thay đổi
    let priceHistory = product.priceHistory;
    if (price !== undefined && price !== product.price) {
      priceHistory.push({ price, updatedAt: new Date() });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        categoryId: categoryId || product.categoryId,
        name: name || product.name,
        title: title !== undefined ? title : product.title,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? price : product.price,
        stock: stock !== undefined ? stock : product.stock,
        quantity: quantity !== undefined ? quantity : product.quantity,
        category: category !== undefined ? category : product.category,
        slug: slug || product.slug,
        productCode: productCode || product.productCode,
        images: images !== undefined ? images : product.images,
        selectedColor: selectedColor !== undefined ? selectedColor : product.selectedColor,
        selectedSize: selectedSize !== undefined ? selectedSize : product.selectedSize,
        variants: variants || product.variants,
        isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
        priceHistory
      },
      { new: true, runValidators: true }
    );

    await updatedProduct?.populate("categoryId", "name");
    
    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy sản phẩm" 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: "Đã xóa sản phẩm thành công" 
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Lấy sản phẩm nổi bật
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("categoryId", "name");
    
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Error getting featured products:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Lấy sản phẩm theo slug
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ slug })
      .populate("categoryId", "name");
      
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy sản phẩm" 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error getting product by slug:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}; 