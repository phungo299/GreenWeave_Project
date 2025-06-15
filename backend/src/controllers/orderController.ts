import { Request, Response } from "express";
import mongoose from "mongoose";
import { Cart, Order, Payment, Product } from "../models";
import payosService from "../services/payosService";

// Lấy tất cả đơn hàng của người dùng
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID người dùng không hợp lệ",
        data: null
      });
    }
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("paymentId")
      .populate({
        path: "items.productId",
        select: "name price description imageUrl images variants slug"
      });
    
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: orders
    });
  } catch (error: any) {
    console.error('Error in getUserOrders:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách đơn hàng",
      data: null
    });
  }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID đơn hàng không hợp lệ",
        data: null
      });
    }
    
    const order = await Order.findById(orderId)
      .populate("paymentId")
      .populate({
        path: "items.productId",
        select: "name price description imageUrl images variants slug"
      });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy đơn hàng",
        data: null
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin đơn hàng thành công",
      data: order
    });
  } catch (error: any) {
    console.error('Error in getOrderById:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi server khi lấy thông tin đơn hàng",
      data: null
    });
  }
};

// Tạo đơn hàng mới từ giỏ hàng hoặc trực tiếp
export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Support both legacy (userId in params) and new (userId in body) formats
    const userId = req.params.userId || req.body.userId;
    const { 
      shippingAddress, 
      paymentMethod, 
      items, 
      totalAmount, 
      shippingCost,
      status = "pending"
    } = req.body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID người dùng không hợp lệ",
        data: null
      });
    }
    
    // 🚨 CRITICAL FIX: Validate shipping address for ALL order creation flows
    if (!shippingAddress || shippingAddress.trim() === '') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "Địa chỉ giao hàng là bắt buộc và không được để trống",
        data: null
      });
    }
    
    let orderItems = [];
    let calculatedTotal = 0;
    
    // New flow: items provided directly in request body
    if (items && Array.isArray(items)) {
      // Validate and process provided items
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ 
            success: false,
            message: `Không tìm thấy sản phẩm với ID: ${item.productId}`,
            data: null
          });
        }
        
        // Check stock
        if (product.quantity < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            success: false,
            message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho`,
            data: null
          });
        }
        
        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.price || product.price
        });
        
        calculatedTotal += (item.price || product.price) * item.quantity;
        
        // Decrease stock
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: -item.quantity } },
          { session }
        );
      }
    } else {
      // Legacy flow: get items from cart
      
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false,
          message: "Giỏ hàng trống",
          data: null
        });
      }
      
      // Process cart items
      for (const item of cart.items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ 
            success: false,
            message: `Không tìm thấy sản phẩm với ID: ${item.productId}`,
            data: null
          });
        }
        
        if (product.quantity < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            success: false,
            message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} sản phẩm trong kho`,
            data: null
          });
        }
        
        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          color: item.color,
          quantity: item.quantity,
          unitPrice: product.price
        });
        
        calculatedTotal += product.price * item.quantity;
        
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: -item.quantity } },
          { session }
        );
      }
      
      // Clear cart after processing
      cart.items = [];
      await cart.save({ session });
    }
    
    // Use provided total or calculated total
    const finalTotal = totalAmount || calculatedTotal;
    
    // Create new order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount: finalTotal,
      shippingCost: shippingCost || 0,
      status,
      shippingAddress,
      paymentMethod: paymentMethod?.toUpperCase() || "COD",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // +10 phút
    });
    
    const savedOrder = await newOrder.save({ session });
    
    // Create payment record if payment method specified
    if (paymentMethod && paymentMethod.toUpperCase() !== "COD") {
      const payment = new Payment({
        orderId: savedOrder._id,
        amount: finalTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        status: "pending"
      });
      
      const savedPayment = await payment.save({ session });
      savedOrder.paymentId = savedPayment._id;
      await savedOrder.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    // Return created order
    const completeOrder = await Order.findById(savedOrder._id)
      .populate("paymentId")
      .populate({
        path: "items.productId",
        select: "name price description imageUrl images"
      });
    
    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: {
        orderId: savedOrder._id,
        order: completeOrder
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in createOrder:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi server khi tạo đơn hàng",
      data: null
    });
  }
};

// 🚀 NEW: Hủy đơn hàng với atomic transaction + PayOS cancellation
export const cancelOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { orderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: "ID đơn hàng không hợp lệ",
        data: null
      });
    }
    
    // Tìm đơn hàng và populate payment
    const order = await Order.findById(orderId).populate("paymentId").session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy đơn hàng",
        data: null
      });
    }
    
    // Kiểm tra đơn hàng đã hoàn thành hay đã hủy chưa
    if (order.status === "delivered" || order.status === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false,
        message: `Không thể hủy đơn hàng đã ${order.status === "delivered" ? "hoàn thành" : "hủy"}`,
        data: null
      });
    }
    
    console.log(`🔄 Cancelling order ${orderId} with payment method: ${order.paymentMethod}`);
    
    // 1. Hoàn lại số lượng tồn kho
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: item.quantity } },
        { session }
      );
      console.log(`✅ Restored ${item.quantity} units for product ${item.productId}`);
    }
    
    // 2. Cập nhật trạng thái đơn hàng
    order.status = "cancelled";
    await order.save({ session });
    console.log(`✅ Order ${orderId} status updated to cancelled`);
    
    // 3. Xử lý payment cancellation
    if (order.paymentId) {
      const payment = order.paymentId as any; // Type assertion for populated field
      
      if (payment && payment.status === "pending") {
        // Update payment status
        payment.status = "cancelled";
        await payment.save({ session });
        console.log(`✅ Payment ${payment._id} status updated to cancelled`);
        
        // 4. Cancel PayOS payment link if applicable
        if (order.paymentMethod === "PAYOS" && payment.payosOrderCode) {
          try {
            console.log(`🔗 Attempting to cancel PayOS payment link: ${payment.payosOrderCode}`);
            const cancelResult = await payosService.cancelPaymentLink(payment.payosOrderCode);
            
            if (cancelResult.success) {
              console.log(`✅ PayOS payment link cancelled successfully`);
            } else {
              console.warn(`⚠️ PayOS cancellation failed: ${cancelResult.error}`);
              // Don't fail the entire transaction for PayOS errors
            }
          } catch (payosError: any) {
            console.warn(`⚠️ PayOS cancellation error: ${payosError.message}`);
            // Don't fail the entire transaction for PayOS errors
          }
        } else if (order.paymentMethod === "PAYOS") {
          // Try to cancel using order ID if payosOrderCode not available  
          try {
            const orderCodeFromId = parseInt(order._id.toString().slice(-8), 16);
            console.log(`🔗 Attempting to cancel PayOS payment using generated orderCode: ${orderCodeFromId}`);
            const cancelResult = await payosService.cancelPaymentLink(orderCodeFromId.toString());
            
            if (cancelResult.success) {
              console.log(`✅ PayOS payment link cancelled using generated orderCode`);
            } else {
              console.warn(`⚠️ PayOS cancellation with generated orderCode failed: ${cancelResult.error}`);
            }
          } catch (payosError: any) {
            console.warn(`⚠️ PayOS cancellation with generated orderCode error: ${payosError.message}`);
          }
        }
      } else {
        console.log(`ℹ️ Payment ${payment._id} status is ${payment.status}, no cancellation needed`);
      }
    } else {
      console.log(`ℹ️ No payment record found for order ${orderId}`);
    }
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    console.log(`🎉 Order ${orderId} successfully cancelled with all related operations completed`);
    
    // Return updated order
    const updatedOrder = await Order.findById(orderId).populate("paymentId").populate({
      path: "items.productId",
      select: "name price description imageUrl images variants slug"
    });
    
    return res.status(200).json({
      success: true,
      message: "Đơn hàng đã được hủy thành công",
      data: updatedOrder
    });
    
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Error in cancelOrder:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi server khi hủy đơn hàng",
      data: null
    });
  }
};

// Cập nhật trạng thái đơn hàng 
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }
    
    if (!status || !["pending", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ 
        message: "Trạng thái đơn hàng không hợp lệ. Phải là một trong các giá trị: pending, shipped, delivered, cancelled" 
      });
    }
    
    // Tìm đơn hàng cần cập nhật
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    
    // Kiểm tra đơn hàng đã hoàn thành hay đã hủy chưa
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({ 
        message: `Không thể cập nhật đơn hàng đã ${order.status === "delivered" ? "hoàn thành" : "hủy"}` 
      });
    }
    
    // Nếu đơn hàng được hủy, hoàn lại số lượng tồn kho
    if (status === "cancelled" && order.status !== "cancelled" as any) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: item.quantity } }
        );
      }
    }
    
    // Cập nhật trạng thái đơn hàng
    order.status = status;
    await order.save();
    
    return res.status(200).json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng (dành cho admin)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status as string;
    
    // Xây dựng query
    let query: any = {};
    
    // Lọc theo trạng thái
    if (status && ["pending", "shipped", "delivered", "cancelled"].includes(status)) {
      query.status = status;
    }
    
    // Thực thi truy vấn với phân trang
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email")
      .populate("paymentId")
      .populate({
        path: "items.productId",
        select: "name price description imageUrl images slug productCode"
      });
    
    // Đếm tổng số đơn hàng
    const total = await Order.countDocuments(query);
    
    return res.status(200).json({
      orders,
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

// Tìm kiếm đơn hàng 
export const searchOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Lấy các tham số tìm kiếm
    const q = req.query.q as string; // Text search parameter
    const orderId = req.query.orderId as string;
    const userId = req.query.userId as string;
    const status = req.query.status as string;
    const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined;
    const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    
    // Xây dựng base query cho filters khác ngoài text search
    let baseQuery: any = {};
    
    // Tìm theo ID đơn hàng
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      baseQuery._id = new mongoose.Types.ObjectId(orderId);
    }
    
    // Tìm theo ID người dùng
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      baseQuery.userId = new mongoose.Types.ObjectId(userId);
    }
    
    // Tìm theo trạng thái
    if (status && ["pending", "shipped", "delivered", "cancelled"].includes(status)) {
      baseQuery.status = status;
    }
    
    // Tìm theo khoảng giá trị đơn hàng
    if (minAmount !== undefined || maxAmount !== undefined) {
      baseQuery.totalAmount = {};
      if (minAmount !== undefined) baseQuery.totalAmount.$gte = minAmount;
      if (maxAmount !== undefined) baseQuery.totalAmount.$lte = maxAmount;
    }
    
    // Tìm theo khoảng thời gian
    if (startDate !== undefined || endDate !== undefined) {
      baseQuery.createdAt = {};
      if (startDate !== undefined) baseQuery.createdAt.$gte = startDate;
      if (endDate !== undefined) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        baseQuery.createdAt.$lte = endOfDay;
      }
    }

    let finalQuery = baseQuery;

    // Text search logic
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      
      // Tìm users matching search criteria
      const matchingUsers = await mongoose.model('User').find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }).select('_id');
      
      const matchingUserIds = matchingUsers.map(user => user._id);

      // Tìm products matching search criteria
      const matchingProducts = await Product.find({
        $or: [
          { name: searchRegex },
          { title: searchRegex },
          { productCode: searchRegex }
        ]
      }).select('_id');
      
      const matchingProductIds = matchingProducts.map(product => product._id);

      // Build text search conditions
      const textSearchConditions: any[] = [
        // Search in shipping address
        { shippingAddress: searchRegex }
      ];

      // Add user-based search
      if (matchingUserIds.length > 0) {
        textSearchConditions.push({ userId: { $in: matchingUserIds } });
      }

      // Add product-based search  
      if (matchingProductIds.length > 0) {
        textSearchConditions.push({ 'items.productId': { $in: matchingProductIds } });
      }

      // ====== FIX: Thêm partial Order ID search ======
      // Try to search by full order ID if it looks like an ObjectId
      if (mongoose.Types.ObjectId.isValid(q.trim())) {
        textSearchConditions.push({ _id: new mongoose.Types.ObjectId(q.trim()) });
      } else {
        // Search for partial Order ID (convert ObjectId to string and match)
        // This uses $expr with $regexMatch to search in string representation of _id
        textSearchConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: q.trim(),
              options: "i"
            }
          }
        });
      }

      // Combine base query with text search
      finalQuery = {
        ...baseQuery,
        $or: textSearchConditions
      };
    }

    // Xác định hướng sắp xếp
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    // Thực hiện tìm kiếm với bộ lọc, sắp xếp và phân trang
    const orders = await Order.find(finalQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email")
      .populate("paymentId")
      .populate({
        path: "items.productId",
        select: "name price description imageUrl images slug productCode"
      });
    
    // Đếm tổng số kết quả
    const total = await Order.countDocuments(finalQuery);
    
    const filters = {
      q: q || undefined,
      orderId: orderId || undefined,
      userId: userId || undefined,
      status: status || undefined,
      minAmount: minAmount || undefined, 
      maxAmount: maxAmount || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc"
    };
    
    return res.status(200).json({
      orders,
      filters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error in searchOrders:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Lấy thống kê đơn hàng 
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Tính ngày đầu và cuối tháng hiện tại
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth, 1);
    
    // Thống kê đơn hàng tháng hiện tại
    const currentMonthStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lt: startOfNextMonth
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Tổng số đơn hàng tháng hiện tại
    const totalOrdersThisMonth = await Order.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth
      }
    });
    
    // Doanh thu theo từng tháng trong năm (chỉ đơn hàng delivered)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: {
            $gte: new Date(currentYear, 0, 1), // Đầu năm
            $lt: new Date(currentYear + 1, 0, 1) // Đầu năm sau
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    
    // Tạo array 12 tháng với doanh thu (default 0)
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlyRevenue.find(item => item._id === index + 1);
      return {
        month: index + 1,
        name: `T${index + 1}`,
        revenue: monthData ? monthData.revenue : 0,
        count: monthData ? monthData.count : 0
      };
    });
    
    // Tính tổng doanh thu năm hiện tại
    const totalRevenueThisYear = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    
    // Doanh thu tháng hiện tại (chỉ đơn hàng delivered)
    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: {
            $gte: startOfMonth,
            $lt: startOfNextMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const thisMonthRevenue = currentMonthRevenue[0]?.revenue || 0;
    const thisMonthDeliveredOrders = currentMonthRevenue[0]?.count || 0;
    
    // Trả về thống kê
    return res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          totalOrders: totalOrdersThisMonth,
          revenue: thisMonthRevenue,
          deliveredOrders: thisMonthDeliveredOrders,
          statusBreakdown: currentMonthStats
        },
        yearlyRevenue: {
          total: totalRevenueThisYear,
          monthlyData: monthlyData
        },
        period: {
          year: currentYear,
          month: currentMonth,
          monthName: startOfMonth.toLocaleDateString('vi-VN', { month: 'long' })
        }
      },
      message: "Lấy thống kê đơn hàng thành công"
    });
  } catch (error: any) {
    console.error('Error in getOrderStats:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi server khi lấy thống kê đơn hàng",
      data: null
    });
  }
};

// Tạo đơn hàng test (không cần validate products)
export const createTestOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.params.userId || req.body.userId;
    const { 
      items, 
      totalAmount, 
      shippingCost = 0,
      paymentMethod = "PAYOS",
      status = "pending"
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "ID người dùng là bắt buộc",
        data: null
      });
    }
    
    // For test orders, we don't validate against real products
    const orderItems = items.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(), // Generate fake ObjectId for test
      variantId: item.variantId || "",
      color: item.color || "",
      quantity: item.quantity,
      unitPrice: item.price
    }));
    
    // Create test order
    const newOrder = new Order({
      userId: mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(),
      items: orderItems,
      totalAmount: totalAmount,
      shippingCost: shippingCost,
      status: status,
      paymentMethod: paymentMethod,
      shippingAddress: "Test Address - PayOS Integration Test"
    });
    
    const savedOrder = await newOrder.save({ session });
    
    // Create test payment record
    const payment = new Payment({
      orderId: savedOrder._id,
      amount: totalAmount,
      paymentMethod: paymentMethod,
      status: "pending"
    });
    
    const savedPayment = await payment.save({ session });
    
    // Link payment to order
    savedOrder.paymentId = savedPayment._id;
    await savedOrder.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng test thành công",
      data: {
        orderId: savedOrder._id,
        orderCode: savedOrder._id.toString().slice(-8), // Use last 8 chars as orderCode
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
        paymentId: savedPayment._id
      }
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in createTestOrder:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Lỗi server khi tạo đơn hàng test",
      data: null
    });
  }
};

export const retryPayment = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = (req as any).user?._id;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Order ID không hợp lệ", data: null });
    }

    const order = await Order.findById(orderId).populate("paymentId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng", data: null });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    if (!["pending", "expired"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Đơn hàng không thể thanh toán lại", data: null });
    }

    const amount = order.totalAmount;
    const newLink = await payosService.createPaymentLink({
      orderId: order._id.toString(),
      amount,
      description: `Thanh toán đơn hàng ${order._id}`,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
    });

    if (newLink.success) {
      order.status = "pending";
      order.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await order.save();

      return res.status(200).json({ success: true, checkoutUrl: newLink.data.checkoutUrl });
    }

    return res.status(500).json({ success: false, message: newLink.error || "Không tạo được link thanh toán" });
  } catch (error: any) {
    console.error("Retry payment error", error);
    return res.status(500).json({ success: false, message: error.message || "Lỗi server" });
  }
};