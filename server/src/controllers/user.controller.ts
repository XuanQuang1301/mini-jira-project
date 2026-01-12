import { Request, Response } from "express";
import { 
  createUserService, 
  loginUserService, 
  getAllUsersService 
} from "../services/user.service";

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

// Lấy danh sách tất cả người dùng (Thường dùng cho Admin hoặc chọn member)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: "Lỗi lấy danh sách user" });
  }
};