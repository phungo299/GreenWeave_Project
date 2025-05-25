import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { ValidationError } from "../errors/validationError";
import { User } from "../models";
import { sendVerificationEmail } from "../services/emails";
import { randomText, signToken } from "../utils";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const formatUsername = username.trim().toLowerCase();
    const formatEmail = email.trim().toLowerCase();
    const formatPassword = password.trim();

    const errors: any = {};

    if (!formatUsername || !formatEmail || !formatPassword) {
      errors.message = "Vui lòng điền đầy đủ các trường!";
      throw new ValidationError(errors);
    }

    // Check username format
    if (formatUsername.length < 8 || formatUsername.length > 30) {
      errors.username = "Tên tài khoản phải có độ dài từ 8 đến 30 ký tự!";
      throw new ValidationError(errors);
    }
    if (!/^(?:[a-zA-Z0-9_]{8,30})$/.test(formatUsername)) {
      errors.username = "Tên tài khoản phải có độ dài từ 8 đến 30 ký tự!";
      throw new ValidationError(errors);
    }

    // Check email format
    if (
      !/^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$/.test(formatEmail)
    ) {
      errors.email = "Email không hợp lệ!";
      throw new ValidationError(errors);
    }

    const existingUser = await User.findOne({
      $or: [{ username: formatUsername }, { email: formatEmail }],
    });

    if (existingUser) {
      if (existingUser.username === formatUsername) {
        errors.username = "Tên tài khoản này đã được sử dụng!";
      }
      if (existingUser.email === formatEmail) {
        errors.email = "Email này đã được sử dụng!";
      }
      throw new ValidationError(errors);
    }

    // Check password strength
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{6,30}$/.test(
        formatPassword
      )
    ) {
      errors.password =
        "Mật khẩu phải chứa chữ thường, in hoa, số, ký tự đặc biệt và từ 6 đến 30 ký tự!";
      throw new ValidationError(errors);
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(formatPassword, salt);

    const newUser = await User.create({
      username: formatUsername,
      email: formatEmail,
      passwordHash: hashedPass,
      isVerified: false,
    });

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Set verification token and expiry time
    const verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    newUser.resetPasswordToken = verificationToken;
    newUser.resetPasswordExpires = new Date(verificationTokenExpiresAt);
    await newUser.save();

    // Generate token
    const token = await signToken({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    // Thử gửi email xác thực
    try {
      await sendVerificationEmail(
        newUser.email,
        newUser.username,
        verificationToken
      );
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      // Không throw error, chỉ log để user vẫn có thể đăng ký
      // Có thể thêm thông báo cho user biết email không gửi được
    }

    return res.status(201).json({
      message: "Đăng ký thành công!",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isVerified: false,
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

export const registerAtCenter = async (req: Request, res: Response) => {
  try {
    const {
      phone,
      email,
      username,
      address
    } = req.body;

    const formatEmail = email.trim().toLowerCase();
    const formatUserName = username || email.split("@")[0];

    if (!phone || !formatEmail) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ các trường" });
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash("12345678", salt);

    const newUser = await User.create({
      username: formatUserName,
      email: formatEmail,
      passwordHash: hashedPass,
      phone,
      address: address || ""
    });

    const formattedData = {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      phone: newUser.phone,
      address: newUser.address
    };

    return res.status(200).json({ data: formattedData });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { verifyCode } = req.body;
    
    // Validate input
    if (!verifyCode) {
      return res.status(400).json({ 
        message: "Vui lòng nhập mã xác thực",
        success: false 
      });
    }

    // Trim and validate code format
    const trimmedCode = verifyCode.toString().trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      return res.status(400).json({ 
        message: "Mã xác thực phải là 6 chữ số",
        success: false 
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: trimmedCode,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.",
        success: false 
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        message: "Tài khoản đã được xác thực trước đó",
        success: false 
      });
    }

    // Update user verification status
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isVerified = true;

    await user.save();

    return res.status(200).json({ 
      message: "Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.",
      success: true 
    });
  } catch (error: any) {
    console.error("Verify email error:", error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.",
      success: false 
    });
  }
};

// API to check email authentication status
export const checkVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email" });
    }
    
    const formatEmail = email.trim().toLowerCase();
    
    // Check email format
    if (!/^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$/.test(formatEmail)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }
    
    const user = await User.findOne({ email: formatEmail });
    
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này" });
    }
    
    // If the user is authenticated, return a message
    if (user.isVerified) {
      return res.status(400).json({ 
        message: "Tài khoản này đã được xác thực",
        isVerified: true
      });
    }
    
    // If not authenticated, generate and send new OTP code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 phút
    
    user.resetPasswordToken = verificationToken;
    user.resetPasswordExpires = new Date(verificationTokenExpiresAt);
    
    await user.save();
    
    // Send email containing verification code
    await sendVerificationEmail(user.email, user.username, verificationToken);
    
    return res.status(200).json({
      message: "Mã xác thực đã được gửi đến email của bạn",
      isVerified: false
    });
    
  } catch (error: any) {
    console.error("Check verification status error:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi kiểm tra trạng thái xác thực" });
  }
};

export const sendNewVerifyEmail = async (req: Request, res: Response) => {
  const { email, username } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // For testing
    // const verificationToken = "123456";

    const verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = verificationToken;
    user.resetPasswordExpires = new Date(verificationTokenExpiresAt);

    await user.save();

    await sendVerificationEmail(email, username, verificationToken);

    return res
      .status(200)
      .json({ message: "Mã OTP đã được gửi đến email của bạn" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    const errors: any = {};

    // Kiểm tra xem login và password có tồn tại không trước khi trim
    if (!login || !password) {
      errors.message = "Vui lòng điền đầy đủ các trường!";
      throw new ValidationError(errors);
    }

    const formatLogin = login.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!formatLogin || !trimmedPassword) {
      errors.message = "Vui lòng điền đầy đủ các trường!";
      throw new ValidationError(errors);
    }

    const user = await User.findOne({
      $or: [{ email: formatLogin }, { username: formatLogin }],
    });

    if (!user) {
      errors.message = "Tài khoản không tồn tại!";
      errors.login = "Vui lòng kiểm tra lại!";
      throw new ValidationError(errors);
    }

    if (user.isDisabled) {
      errors.message =
        "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên để được hỗ trợ";
      throw new ValidationError(errors);
    }

    if (!user.isVerified && user.role === 'user') {
      errors.message = "Tài khoản chưa được xác thực! Vui lòng kiểm tra email và xác thực tài khoản.";
      throw new ValidationError(errors);
    }

    const comparePassword = await bcrypt.compare(
      trimmedPassword,
      user.passwordHash
    );

    if (!comparePassword) {
      errors.message = "Thông tin đăng nhập sai, vui lòng thử lại!";
      errors.login = "Vui lòng kiểm tra lại!";
      errors.password = "Vui lòng kiểm tra lại!";
      throw new ValidationError(errors);
    }

    const token = await signToken({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: true,
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const { email, username, photoUrl } = req.body;

    const formatEmail = email.trim().toLowerCase();
    const formatUserName = username + "-" + randomText(5);

    let user = await User.findOne({ email: formatEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(randomText(12), salt);
      user = await User.create({
        username: formatUserName,
        email: formatEmail,
        passwordHash: hashedPass,
        avatar: photoUrl,
      });
    } else {
      if (user.isDisabled) {
        return res.status(403).json({
          message:
            "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên để được hỗ trợ",
        });
      }

      if (user.avatar === "") {
        user.avatar = photoUrl;
        await user.save();
      }
    }

    const token = await signToken({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: user.isNew ? "Đăng ký thành công!" : "Đăng nhập thành công!",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || photoUrl,
        isVerified: true,
        token,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi xử lý đăng nhập Google",
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const errors: any = {};

    const formatLogin = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!formatLogin || !trimmedPassword) {
      errors.message = "Vui lòng điền đầy đủ các trường!";
      throw new ValidationError(errors);
    }

    const user = await User.findOne({
      $and: [
        { email: formatLogin },
        { role: { $in: ["admin", "staff"] } },
      ],
    });

    if (!user) {
      errors.message = "Tài khoản không tồn tại!";
      errors.email = "Vui lòng kiểm tra lại!";
      throw new ValidationError(errors);
    }

    if (user.isDisabled) {
      errors.message =
        "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên để được hỗ trợ";
      throw new ValidationError(errors);
    }

    const comparePassword = await bcrypt.compare(
      trimmedPassword,
      user.passwordHash
    );

    if (!comparePassword) {
      errors.message = "Thông tin đăng nhập sai, vui lòng thử lại!";
      errors.email = "Vui lòng kiểm tra lại!";
      errors.password = "Vui lòng kiểm tra lại!";
      throw new ValidationError(errors);
    }

    const token = await signToken({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  res.json({ available: !user });
};

export const checkEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  res.json({ available: !user });
};

// Forgot Password - Send OTP
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Vui lòng nhập email",
        success: false 
      });
    }

    const formatEmail = email.trim().toLowerCase();

    // Check email format
    if (!/^[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}$/.test(formatEmail)) {
      return res.status(400).json({ 
        message: "Định dạng email không hợp lệ",
        success: false 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: formatEmail });
    if (!user) {
      return res.status(404).json({ 
        message: "Không tìm thấy tài khoản với email này",
        success: false 
      });
    }

    // Generate 6-digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetPasswordToken = resetOTP;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send OTP email
    await sendVerificationEmail(user.email, user.username, resetOTP);

    return res.status(200).json({
      message: "Mã OTP đã được gửi đến email của bạn",
      success: true
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi server",
      success: false 
    });
  }
};

// Verify Reset OTP
export const verifyResetOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: "Vui lòng nhập email và mã OTP",
        success: false 
      });
    }

    const formatEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.toString().trim();

    // Validate OTP format
    if (!/^\d{6}$/.test(trimmedOTP)) {
      return res.status(400).json({ 
        message: "Mã OTP phải là 6 chữ số",
        success: false 
      });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email: formatEmail,
      resetPasswordToken: trimmedOTP,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
        success: false 
      });
    }

    return res.status(200).json({
      message: "Xác thực OTP thành công",
      success: true
    });

  } catch (error: any) {
    console.error('Verify reset OTP error:', error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi server",
      success: false 
    });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        message: "Vui lòng điền đầy đủ thông tin",
        success: false 
      });
    }

    const formatEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.toString().trim();
    const formatPassword = newPassword.trim();

    // Validate OTP format
    if (!/^\d{6}$/.test(trimmedOTP)) {
      return res.status(400).json({ 
        message: "Mã OTP không hợp lệ",
        success: false 
      });
    }

    // Validate password strength
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{6,30}$/.test(formatPassword)) {
      return res.status(400).json({ 
        message: "Mật khẩu phải chứa chữ thường, in hoa, số, ký tự đặc biệt và từ 6 đến 30 ký tự",
        success: false 
      });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email: formatEmail,
      resetPasswordToken: trimmedOTP,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Mã OTP không hợp lệ hoặc đã hết hạn",
        success: false 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formatPassword, salt);

    // Update user password and clear reset tokens
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Đặt lại mật khẩu thành công",
      success: true
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi server",
      success: false 
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    // For JWT-based authentication, logout is typically handled client-side
    // by removing the token from localStorage/sessionStorage
    // Here we just return a success response
    
    return res.status(200).json({
      message: "Đăng xuất thành công",
      success: true
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      message: "Đã xảy ra lỗi khi đăng xuất",
      success: false 
    });
  }
};