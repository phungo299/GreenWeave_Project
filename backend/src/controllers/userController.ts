import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../models";
import {
    sendPasswordChangeAlert,
    sendResetPasswordEmail,
} from "../services/emails";
import { AuthRequest } from "../types";

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Không tìm thấy ID người dùng" });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    const formattedProfile = {
      email: user.email,
      username: user.username,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role
    };
    return res.status(200).json({ data: formattedProfile });
  } catch (error: any) {
    console.log("Error in getUser:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi xử lý yêu cầu",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      username,
      phone,
      avatar,
      address,
    } = req.body;

    const userUpdateData: any = {
      phone,
      avatar,
      address,
    };

    if (username) {
      userUpdateData.username = username.toLowerCase();
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      userUpdateData,
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Có lỗi xảy ra khi cập nhật thông tin" });
    }

    const formattedUser = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      address: updatedUser.address
    };

    return res
      .status(200)
      .json({ message: "Cập nhật thành công!", data: formattedUser });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const checkEmailWithPhoneNumber = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phone } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      const existedEmail = await User.findOne({ email });

      if (existedEmail) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(200).json({ exists: false });
      }
    } else {
      const emailCheck = await User.findOne({ email });

      if (emailCheck && emailCheck._id.toString() !== user._id.toString()) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(200).json({ exists: false });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi kiểm tra thông tin",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Danh sách tài khoản trống" });
    }

    const formattedData = users.map((user) => ({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role,
      isDisabled: user.isDisabled,
    }));

    return res.status(200).json({ data: formattedData });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.isDisabled = !user.isDisabled;
    await user.save();

    return res.status(200).json({
      data: user,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message:
        error.message || "Đã xảy ra lỗi khi cập nhật trạng thái tài khoản",
    });
  }
};

export const checkPhoneNumber = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    return res.status(200).json({ exists: !!user, userId: user?._id });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { password, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại không đúng",
        password: "Mật khẩu hiện tại không đúng",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    // Gửi email cảnh báo
    await sendPasswordChangeAlert(user.email, user.username, newPassword);

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi đổi mật khẩu",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const resetToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendResetPasswordEmail(user.email, user.username, resetToken);

    return res.status(200).json({
      message: "Mã xác nhận đã được gửi đến email của bạn",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi gửi yêu cầu",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Mã xác nhận không hợp lệ hoặc đã hết hạn",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu",
    });
  }
};

// Tìm kiếm người dùng
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    const role = req.query.role as string;
    
    // Xây dựng query tìm kiếm
    const searchQuery: any = {};
    
    // Thêm bộ lọc tìm kiếm cơ bản
    if (query) {
      searchQuery.$or = [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } }
      ];
    }
    
    // Thêm bộ lọc theo role
    if (role && ["admin", "user", "staff"].includes(role)) {
      searchQuery.role = role;
    }
    
    // Xác định hướng sắp xếp
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    // Thực hiện tìm kiếm với bộ lọc và phân trang
    const users = await User.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-passwordHash"); // Không trả về trường password
    
    // Đếm tổng số kết quả
    const total = await User.countDocuments(searchQuery);
    
    // Thêm thông tin meta
    const filters = {
      query: query || undefined,
      role: role || undefined,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc"
    };
    
    return res.status(200).json({
      users,
      filters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tìm kiếm người dùng",
    });
  }
};

// Tạo user mới (Admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, phone, role, address } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Username, email và password là bắt buộc" 
      });
    }

    const formatUsername = username.trim().toLowerCase();
    const formatEmail = email.trim().toLowerCase();
    const formatPassword = password.trim();

    // Validate username format
    if (formatUsername.length < 8 || formatUsername.length > 30) {
      return res.status(400).json({ 
        message: "Tên tài khoản phải có độ dài từ 8 đến 30 ký tự" 
      });
    }
    if (!/^(?:[a-zA-Z0-9_]{8,30})$/.test(formatUsername)) {
      return res.status(400).json({ 
        message: "Tên tài khoản chỉ được chứa chữ cái, số và dấu gạch dưới" 
      });
    }

    // Validate email format
    if (!/^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$/.test(formatEmail)) {
      return res.status(400).json({ 
        message: "Email không hợp lệ" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username: formatUsername }, { email: formatEmail }],
    });

    if (existingUser) {
      if (existingUser.username === formatUsername) {
        return res.status(400).json({ 
          message: "Tên tài khoản này đã được sử dụng" 
        });
      }
      if (existingUser.email === formatEmail) {
        return res.status(400).json({ 
          message: "Email này đã được sử dụng" 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(formatPassword, salt);

    // Create new user
    const newUser = new User({
      username: formatUsername,
      email: formatEmail,
      passwordHash,
      phone: phone || "",
      role: role || "user",
      address: address || "",
      isVerified: true // Admin created users are auto-verified
    });

    const savedUser = await newUser.save();

    const formattedUser = {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      phone: savedUser.phone,
      role: savedUser.role,
      address: savedUser.address,
      isVerified: savedUser.isVerified,
      isDisabled: savedUser.isDisabled
    };

    return res.status(201).json({
      message: "Tạo tài khoản thành công",
      data: formattedUser
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo tài khoản"
    });
  }
};

// Cập nhật thông tin user (Admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username, email, phone, role, address, isDisabled } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        message: "User ID là bắt buộc" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "Không tìm thấy người dùng" 
      });
    }

    // Prepare update data
    const updateData: any = {};

    if (username) {
      const formatUsername = username.trim().toLowerCase();
      if (formatUsername.length < 8 || formatUsername.length > 30) {
        return res.status(400).json({ 
          message: "Tên tài khoản phải có độ dài từ 8 đến 30 ký tự" 
        });
      }
      if (!/^(?:[a-zA-Z0-9_]{8,30})$/.test(formatUsername)) {
        return res.status(400).json({ 
          message: "Tên tài khoản chỉ được chứa chữ cái, số và dấu gạch dưới" 
        });
      }
      
      // Check if username already exists (excluding current user)
      const existingUsername = await User.findOne({ 
        username: formatUsername, 
        _id: { $ne: userId } 
      });
      if (existingUsername) {
        return res.status(400).json({ 
          message: "Tên tài khoản này đã được sử dụng" 
        });
      }
      updateData.username = formatUsername;
    }

    if (email) {
      const formatEmail = email.trim().toLowerCase();
      if (!/^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$/.test(formatEmail)) {
        return res.status(400).json({ 
          message: "Email không hợp lệ" 
        });
      }
      
      // Check if email already exists (excluding current user)
      const existingEmail = await User.findOne({ 
        email: formatEmail, 
        _id: { $ne: userId } 
      });
      if (existingEmail) {
        return res.status(400).json({ 
          message: "Email này đã được sử dụng" 
        });
      }
      updateData.email = formatEmail;
    }

    if (phone !== undefined) updateData.phone = phone;
    if (role && ["admin", "user", "staff"].includes(role)) updateData.role = role;
    if (address !== undefined) updateData.address = address;
    if (typeof isDisabled === 'boolean') updateData.isDisabled = isDisabled;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(500).json({ 
        message: "Có lỗi xảy ra khi cập nhật thông tin" 
      });
    }

    const formattedUser = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      address: updatedUser.address,
      isVerified: updatedUser.isVerified,
      isDisabled: updatedUser.isDisabled
    };

    return res.status(200).json({
      message: "Cập nhật thông tin thành công",
      data: formattedUser
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật thông tin"
    });
  }
};

// Thay đổi role của user (Admin only)
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        message: "User ID là bắt buộc" 
      });
    }

    if (!role || !["admin", "user", "staff"].includes(role)) {
      return res.status(400).json({ 
        message: "Role phải là admin, user hoặc staff" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "Không tìm thấy người dùng" 
      });
    }

    user.role = role;
    await user.save();

    const formattedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({
      message: `Đã thay đổi role thành ${role}`,
      data: formattedUser
    });
  } catch (error: any) {
    console.error("Change user role error:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi thay đổi role"
    });
  }
};
