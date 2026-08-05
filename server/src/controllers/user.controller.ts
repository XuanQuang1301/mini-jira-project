import { Request, Response } from "express";
import { 
  createUserService, 
  loginUserService, 
  getAllUsersService,
  getUserProfileService,
  updateUserProfileService,
  updateUserPasswordService,
  updateUserAvatarService,
  lockUserService
} from "../services/user.service";
import { db } from "../db"; 
import { users } from "../db/schema"
import { eq } from "drizzle-orm"; 

// Đăng ký người dùng mới
export const register = async (req: Request, res: Response) => {
  try {
    const user = await createUserService(req.body);
    res.status(201).json({ message: "Đăng ký thành công!", user });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Email đã tồn tại hoặc lỗi hệ thống" });
  }
};

// Đăng nhập và nhận JWT Token
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await loginUserService(email, password);
    res.status(200).json({
      message: "Đăng nhập thành công!",
      ...result
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || "Đăng nhập thất bại" });
  }
};

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (req: any, res: any) => {
    try {
        const allUsers = await getAllUsersService();
        res.status(200).json(allUsers);
    } catch (error: any) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách người dùng" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.delete(users).where(eq(users.id, Number(id)));
        res.status(200).json({ message: "Xóa thành viên thành công" });
    } catch (error: any) {
        res.status(500).json({ error: "Lỗi khi xóa thành viên" });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const profile = await getUserProfileService(userId);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(500).json({ error: "Lỗi khi lấy profile" });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const updated = await updateUserProfileService(userId, req.body);
        res.status(200).json({ message: "Cập nhật profile thành công", user: updated });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updatePassword = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const result = await updateUserPasswordService(userId, req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateAvatar = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const { avatarUrl } = req.body;
        const result = await updateUserAvatarService(userId, avatarUrl);
        res.status(200).json({ message: "Cập nhật avatar thành công", data: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const lockUser = async (req: any, res: Response) => {
    try {
        const { userId } = req.params;
        const { isLocked } = req.body;
        const result = await lockUserService(Number(userId), isLocked);
        res.status(200).json({ message: isLocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản", data: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};