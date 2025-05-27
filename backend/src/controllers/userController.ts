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
      role: user.role,
      fullName: user.fullName,
      rewardPoints: user.rewardPoints
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
      fullName,
    } = req.body;

    const userUpdateData: any = {
      phone,
      avatar,
      address,
      fullName,
    };

    // Không cho phép cập nhật username và email qua API này
    // if (username) {
    //   userUpdateData.username = username.toLowerCase();
    // }

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
      address: updatedUser.address,
      fullName: updatedUser.fullName,
      rewardPoints: updatedUser.rewardPoints
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

export const getAllUsersIncludingAdmin = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});

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

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role,
      fullName: user.fullName || "",
      isDisabled: user.isDisabled,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({ data: userData });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi lấy thông tin người dùng",
    });
  }
};

// Create user (admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, phone, role, address, fullName, isDisabled } = req.body;

    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({ 
        message: "Username và email là bắt buộc" 
      });
    }

    const formatUsername = username.trim().toLowerCase();
    const formatEmail = email.trim().toLowerCase();
    
    // Generate a default password if none is provided
    let formatPassword = password ? password.trim() : '';
    if (!formatPassword) {
      // Generate a random password with 8 characters
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 8; i++) {
        formatPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Add special character and number to ensure password complexity
      formatPassword += '@1';
    }

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
      fullName: fullName || "",
      isDisabled: isDisabled || false,
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
      fullName: savedUser.fullName,
      isVerified: savedUser.isVerified,
      isDisabled: savedUser.isDisabled
    };

    // Add the generated password to the response if it was auto-generated
    const response = {
      message: "Tạo tài khoản thành công",
      data: formattedUser
    };

    if (!password) {
      response.message = `Tạo tài khoản thành công. Mật khẩu mặc định: ${formatPassword}`;
    }

    return res.status(201).json(response);
  } catch (error: any) {
    console.error("Create user error:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo tài khoản"
    });
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username, email, phone, role, address, fullName, isDisabled } = req.body;

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
    if (fullName !== undefined) updateData.fullName = fullName;
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
      fullName: updatedUser.fullName,
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

// Thay đổi role của user (Admin only)
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "user", "staff"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({
      message: "Cập nhật role thành công",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi cập nhật role",
    });
  }
};

// Thêm các function mới cho profile và addresses
export const getUserProfile = async (req: AuthRequest, res: Response) => {
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
      id: user._id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
      fullName: user.fullName,
      rewardPoints: user.rewardPoints,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return res.status(200).json({ 
      success: true,
      data: formattedProfile 
    });
  } catch (error: any) {
    console.log("Error in getUserProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu",
    });
  }
};

export const getUserAddresses = async (req: AuthRequest, res: Response) => {
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

    // Nếu address là object, chuyển thành array
    let addresses = [];
    if (user.address) {
      if (Array.isArray(user.address)) {
        addresses = user.address;
      } else {
        // Nếu address là object, chuyển thành array với 1 phần tử
        addresses = [{
          id: "default",
          street: user.address.street || "",
          city: user.address.city || "",
          state: user.address.state || "",
          zipCode: user.address.zipCode || "",
          country: user.address.country || "",
          isDefault: true
        }];
      }
    }
    
    return res.status(200).json({ 
      success: true,
      data: addresses 
    });
  } catch (error: any) {
    console.log("Error in getUserAddresses:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách địa chỉ",
    });
  }
};

export const addUserAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { 
      // Cấu trúc mới cho địa chỉ Việt Nam
      country,
      countryCode,
      province,
      provinceCode,
      district,
      districtCode,
      ward,
      wardCode,
      streetAddress,
      zipCode,
      isDefault,
      // Cấu trúc cũ để tương thích ngược
      street,
      city,
      state
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Không tìm thấy ID người dùng" });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    // Tạo địa chỉ mới với cấu trúc linh hoạt
    const newAddress: any = {
      _id: new Date().getTime().toString(),
      isDefault: isDefault || false
    };

    // Ưu tiên cấu trúc mới (Việt Nam)
    if (province && district) {
      newAddress.country = country || "Việt Nam";
      newAddress.countryCode = countryCode || "VN";
      newAddress.province = province;
      newAddress.provinceCode = provinceCode;
      newAddress.district = district;
      newAddress.districtCode = districtCode;
      newAddress.ward = ward || "";
      newAddress.wardCode = wardCode || "";
      newAddress.streetAddress = streetAddress || "";
      newAddress.zipCode = zipCode || "";
    } else {
      // Fallback cho cấu trúc cũ
      newAddress.street = street || "";
      newAddress.city = city || "";
      newAddress.state = state || "";
      newAddress.zipCode = zipCode || "";
      newAddress.country = country || "Vietnam";
    }

    // Khởi tạo addresses array nếu chưa có
    if (!user.address || !Array.isArray(user.address)) {
      user.address = [];
    }

    // Nếu địa chỉ mới là default, bỏ default của các địa chỉ khác
    if (newAddress.isDefault) {
      user.address = user.address.map((addr: any) => ({
        ...addr,
        isDefault: false
      }));
    }

    // Nếu đây là địa chỉ đầu tiên, tự động đặt làm default
    if (user.address.length === 0) {
      newAddress.isDefault = true;
    }

    user.address.push(newAddress);
    await user.save();
    
    return res.status(201).json({ 
      success: true,
      message: "Thêm địa chỉ thành công",
      data: newAddress 
    });
  } catch (error: any) {
    console.log("Error in addUserAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi thêm địa chỉ",
    });
  }
};

export const updateUserAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { addressId } = req.params;
    const { 
      // Cấu trúc mới cho địa chỉ Việt Nam
      country,
      countryCode,
      province,
      provinceCode,
      district,
      districtCode,
      ward,
      wardCode,
      streetAddress,
      zipCode,
      isDefault,
      // Cấu trúc cũ để tương thích ngược
      street,
      city,
      state
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Không tìm thấy ID người dùng" });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    if (!user.address || !Array.isArray(user.address)) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    const addressIndex = user.address.findIndex((addr: any) => addr._id === addressId || addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    // Nếu địa chỉ được set làm default, bỏ default của các địa chỉ khác
    if (isDefault) {
      user.address = user.address.map((addr: any, index: number) => ({
        ...addr,
        isDefault: index === addressIndex
      }));
    }

    // Cập nhật địa chỉ với cấu trúc linh hoạt
    const currentAddress = user.address[addressIndex];
    
    // Ưu tiên cấu trúc mới (Việt Nam)
    if (province && district) {
      user.address[addressIndex] = {
        ...currentAddress,
        country: country || currentAddress.country || "Việt Nam",
        countryCode: countryCode || currentAddress.countryCode || "VN",
        province: province,
        provinceCode: provinceCode,
        district: district,
        districtCode: districtCode,
        ward: ward || "",
        wardCode: wardCode || "",
        streetAddress: streetAddress || currentAddress.streetAddress || "",
        zipCode: zipCode || currentAddress.zipCode || "",
        isDefault: isDefault !== undefined ? isDefault : currentAddress.isDefault
      };
    } else {
      // Fallback cho cấu trúc cũ
      user.address[addressIndex] = {
        ...currentAddress,
        street: street || currentAddress.street,
        city: city || currentAddress.city,
        state: state || currentAddress.state,
        zipCode: zipCode || currentAddress.zipCode,
        country: country || currentAddress.country,
        isDefault: isDefault !== undefined ? isDefault : currentAddress.isDefault
      };
    }

    await user.save();
    
    return res.status(200).json({ 
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: user.address[addressIndex] 
    });
  } catch (error: any) {
    console.log("Error in updateUserAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật địa chỉ",
    });
  }
};

export const deleteUserAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { addressId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Không tìm thấy ID người dùng" });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    if (!user.address || !Array.isArray(user.address)) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    const addressIndex = user.address.findIndex((addr: any) => addr._id === addressId || addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    user.address.splice(addressIndex, 1);
    await user.save();
    
    return res.status(200).json({ 
      success: true,
      message: "Xóa địa chỉ thành công"
    });
  } catch (error: any) {
    console.log("Error in deleteUserAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xóa địa chỉ",
    });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { addressId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Không tìm thấy ID người dùng" });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    if (!user.address || !Array.isArray(user.address)) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    const addressIndex = user.address.findIndex((addr: any) => addr._id === addressId || addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    // Bỏ default của tất cả địa chỉ khác
    user.address = user.address.map((addr: any, index: number) => ({
      ...addr,
      isDefault: index === addressIndex
    }));

    await user.save();
    
    return res.status(200).json({ 
      success: true,
      message: "Đã đặt làm địa chỉ mặc định",
      data: user.address[addressIndex]
    });
  } catch (error: any) {
    console.log("Error in setDefaultAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi đặt địa chỉ mặc định",
    });
  }
};
