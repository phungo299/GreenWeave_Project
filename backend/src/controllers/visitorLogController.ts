import { Request, Response } from "express";
import VisitorLog from "../models/VisitorLog";

// Lấy tất cả visitor logs (Admin only)
export const getAllVisitorLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || "visitedAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const country = req.query.country as string;
    const path = req.query.path as string;
    
    // Xây dựng query
    const query: any = {};
    
    if (startDate || endDate) {
      query.visitedAt = {};
      if (startDate) query.visitedAt.$gte = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.visitedAt.$lte = endOfDay;
      }
    }
    
    if (country) query.country = { $regex: country, $options: "i" };
    if (path) query.path = { $regex: path, $options: "i" };
    
    // Xác định hướng sắp xếp
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    const logs = await VisitorLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email");
    
    const total = await VisitorLog.countDocuments(query);
    
    return res.status(200).json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get all visitor logs error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi lấy danh sách visitor logs" 
    });
  }
};

// Tạo visitor log mới
export const createVisitorLog = async (req: Request, res: Response) => {
  try {
    const {
      ipAddress,
      userAgent,
      referer,
      path,
      method,
      userId,
      sessionId,
      country,
      city,
      device,
      browser,
      os
    } = req.body;
    
    if (!ipAddress || !userAgent || !path || !method) {
      return res.status(400).json({ 
        message: "IP address, user agent, path và method là bắt buộc" 
      });
    }
    
    const newLog = new VisitorLog({
      ipAddress,
      userAgent,
      referer: referer || "",
      path,
      method,
      userId: userId || null,
      sessionId: sessionId || "",
      country: country || "",
      city: city || "",
      device: device || "",
      browser: browser || "",
      os: os || ""
    });
    
    const savedLog = await newLog.save();
    
    return res.status(201).json({
      message: "Tạo visitor log thành công",
      data: savedLog
    });
  } catch (error: any) {
    console.error("Create visitor log error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi tạo visitor log" 
    });
  }
};

// Lấy thống kê visitor
export const getVisitorStats = async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const dateQuery = {
      visitedAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    // Tổng số visits
    const totalVisits = await VisitorLog.countDocuments(dateQuery);
    
    // Unique visitors (by IP)
    const uniqueVisitors = await VisitorLog.distinct("ipAddress", dateQuery);
    
    // Top countries
    const topCountries = await VisitorLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Top pages
    const topPages = await VisitorLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Daily visits
    const dailyVisits = await VisitorLog.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            year: { $year: "$visitedAt" },
            month: { $month: "$visitedAt" },
            day: { $dayOfMonth: "$visitedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    
    return res.status(200).json({
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      topCountries,
      topPages,
      dailyVisits,
      period: {
        startDate,
        endDate
      }
    });
  } catch (error: any) {
    console.error("Get visitor stats error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi lấy thống kê visitor" 
    });
  }
};

// Xóa visitor logs cũ (Admin only)
export const cleanupOldLogs = async (req: Request, res: Response) => {
  try {
    const daysToKeep = parseInt(req.query.days as string) || 90; // Default 90 days
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await VisitorLog.deleteMany({
      visitedAt: { $lt: cutoffDate }
    });
    
    return res.status(200).json({
      message: `Đã xóa ${result.deletedCount} logs cũ hơn ${daysToKeep} ngày`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error("Cleanup old logs error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi xóa logs cũ" 
    });
  }
}; 