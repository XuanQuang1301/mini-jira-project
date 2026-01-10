import { Router } from "express";
import { createUserService, getAllUsersService, loginUserService } from "../services/user.service";

const router = Router();

// Đăng ký người dùng
router.post("/register", async (req, res) => {
  try {
    const user = await createUserService(req.body);
    res.status(201).json({ message: "Đăng ký thành công!", user });
  } catch (error) {
    res.status(500).json({ error: "Email đã tồn tại hoặc lỗi hệ thống" });
  }
});
// API Đăng nhập
router.post("/login", async (req, res) => {
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
});

// Lấy danh sách user
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách user" });
  }
});

export default router;