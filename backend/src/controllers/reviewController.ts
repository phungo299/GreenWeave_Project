import { Request, Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models";

// Lấy tất cả đánh giá (Admin only)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    
    // Xác định hướng sắp xếp
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    // Lấy tất cả reviews với thông tin đầy đủ
    const reviews = await Review.find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email avatar fullName phone")
      .populate("productId", "name title price imageUrl images productCode");
    
    // Đếm tổng số reviews
    const total = await Review.countDocuments();
    
    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get all review error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách đánh giá" 
    });
  }
};

// Lấy chi tiết đánh giá theo ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID đánh giá không hợp lệ" 
      });
    }
    
    const review = await Review.findById(reviewId)
      .populate("userId", "username email avatar fullName phone")
      .populate("productId", "name title price imageUrl images productCode");
    
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy đánh giá" 
      });
    }
    
    return res.status(200).json({
      success: true,
      review
    });
  } catch (error: any) {
    console.error("Get review by ID error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin đánh giá" 
    });
  }
};

// Lấy đánh giá cho một sản phẩm
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }
    
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .populate("userId", "username avatar");
    
    return res.status(200).json(reviews);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đánh giá của một người dùng
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }
    
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .populate("productId", "name price imageUrl");
    
    return res.status(200).json(reviews);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Tạo đánh giá mới
export const createReview = async (req: Request, res: Response) => {
  try {
    const { userId, productId, rating, comment } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao" });
    }
    
    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ 
        message: "Bạn đã đánh giá sản phẩm này rồi. Vui lòng cập nhật đánh giá cũ thay vì tạo mới." 
      });
    }
    
    // Tạo đánh giá mới
    const review = new Review({
      userId,
      productId,
      rating,
      comment: comment || ""
    });
    
    const savedReview = await review.save();
    
    // Lấy review với thông tin người dùng
    const populatedReview = await Review.findById(savedReview._id)
      .populate("userId", "username avatar")
      .populate("productId", "name price");
    
    return res.status(201).json(populatedReview);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Cập nhật đánh giá
export const updateReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "ID đánh giá không hợp lệ" });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao" });
    }
    
    // Tìm và cập nhật đánh giá
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, comment },
      { new: true, runValidators: true }
    )
      .populate("userId", "username avatar")
      .populate("productId", "name price");
    
    if (!updatedReview) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }
    
    return res.status(200).json(updatedReview);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Xóa đánh giá
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "ID đánh giá không hợp lệ" });
    }
    
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }
    
    return res.status(200).json({ message: "Đã xóa đánh giá thành công" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm đánh giá
export const searchReviews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Lấy các tham số tìm kiếm
    const productId = req.query.productId as string;
    const userId = req.query.userId as string;
    const minRating = req.query.minRating ? parseInt(req.query.minRating as string) : undefined;
    const maxRating = req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined;
    const keyword = req.query.keyword as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    
    // Xây dựng pipeline aggregation để tìm kiếm mở rộng
    const pipeline: any[] = [];
    
    // Stage 1: Populate user và product thông tin
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId"
        }
      },
      {
        $unwind: "$userId"
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productId"
        }
      },
      {
        $unwind: "$productId"
      }
    );
    
    // Stage 2: Match conditions
    const matchConditions: any = {};
    
    // Tìm theo ID sản phẩm
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      matchConditions["productId._id"] = new mongoose.Types.ObjectId(productId);
    }
    
    // Tìm theo ID người dùng
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      matchConditions["userId._id"] = new mongoose.Types.ObjectId(userId);
    }
    
    // Tìm theo khoảng đánh giá
    if (minRating !== undefined || maxRating !== undefined) {
      matchConditions.rating = {};
      if (minRating !== undefined) matchConditions.rating.$gte = minRating;
      if (maxRating !== undefined) matchConditions.rating.$lte = maxRating;
    }
    
    // Tìm theo khoảng thời gian
    if (startDate !== undefined || endDate !== undefined) {
      matchConditions.createdAt = {};
      if (startDate !== undefined) matchConditions.createdAt.$gte = startDate;
      if (endDate !== undefined) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchConditions.createdAt.$lte = endOfDay;
      }
    }
    
    // Tìm theo từ khóa (mở rộng: comment, username, email, product name)
    if (keyword) {
      matchConditions.$or = [
        { comment: { $regex: keyword, $options: "i" } },
        { "userId.username": { $regex: keyword, $options: "i" } },
        { "userId.email": { $regex: keyword, $options: "i" } },
        { "productId.name": { $regex: keyword, $options: "i" } },
        { "productId.title": { $regex: keyword, $options: "i" } }
      ];
    }
    
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }
    
    // Stage 3: Sort
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    pipeline.push({ $sort: sort });
    
    // Stage 4: Facet để lấy data và count
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              rating: 1,
              comment: 1,
              createdAt: 1,
              updatedAt: 1,
              userId: {
                _id: "$userId._id",
                username: "$userId.username",
                email: "$userId.email",
                avatar: "$userId.avatar",
                fullName: "$userId.fullName"
              },
              productId: {
                _id: "$productId._id",
                name: "$productId.name",
                title: "$productId.title",
                price: "$productId.price",
                imageUrl: "$productId.imageUrl",
                images: "$productId.images",
                productCode: "$productId.productCode"
              }
            }
          }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    });
    
    // Thực hiện aggregation
    const result = await Review.aggregate(pipeline);
    const reviews = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;
    
    // Thêm thông tin meta
    const filters = {
      productId: productId || undefined,
      userId: userId || undefined,
      minRating: minRating || undefined,
      maxRating: maxRating || undefined,
      keyword: keyword || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc"
    };
    
    return res.status(200).json({
      success: true,
      reviews,
      filters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Search reviews error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Đã xảy ra lỗi khi tìm kiếm đánh giá" 
    });
  }
}; 