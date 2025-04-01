import { Request, Response } from "express";
import { Admin, User } from "../models";

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.find()
      .populate({
        path: "userId",
        select: "fullName gender phoneNumber email",
      })
      .select("userId position permissions")
      .sort({ createdAt: -1 });

    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "Danh sách admin trống" });
    }

    const formattedData = admins.map((admin) => ({
      id: admin._id,
      email: admin.userId.email,
      adminName: admin.userId.fullName ?? "",
      phoneNumber: admin.userId.phoneNumber ?? "",
      gender: admin.userId.gender ?? "",
      position: admin.position,
      permissions: admin.permissions,
    }));

    return res.status(200).json({ data: formattedData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách admin" });
  }
};

export const getAdminById = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    
    const admin = await Admin.findById(adminId)
      .populate({
        path: "userId",
        select: "fullName email phoneNumber gender",
      })
      .select("position permissions");

    if (!admin) {
      return res.status(404).json({ message: "Không tìm thấy admin" });
    }

    const formattedData = {
      id: admin._id,
      email: admin.userId.email,
      fullName: admin.userId.fullName,
      phoneNumber: admin.userId.phoneNumber,
      gender: admin.userId.gender,
      position: admin.position,
      permissions: admin.permissions,
    };

    return res.status(200).json({ data: formattedData });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateAdminById = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const { fullName, gender, position, permissions } = req.body;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Không tìm thấy admin" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: admin.userId },
      {
        fullName,
        gender,
      },
      { new: true }
    );

    const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: adminId },
      {
        position,
        permissions,
      },
      { new: true }
    );

    if (!updatedAdmin || !updatedUser) {
      return res
        .status(500)
        .json({ message: "Có lỗi xảy ra khi cập nhật thông tin" });
    }

    const formattedData = {
      id: updatedAdmin._id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      gender: updatedUser.gender,
      position: updatedAdmin.position,
      permissions: updatedAdmin.permissions,
    };

    return res.status(200).json({ data: formattedData });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getTotalAdmins = async (req: Request, res: Response) => {
  try {
    const totalAdmins = await Admin.countDocuments();

    return res.status(200).json({
      data: {
        totalAdmins,
      },
    });
  } catch (error: any) {
    console.error("Lỗi:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy số lượng admin",
    });
  }
}; 