import { Router } from "express";
import { register, login, getAllUsers } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware"; // Import middleware bảo mật

const router = Router();

// Route công khai (Public)
router.post("/register", register);
router.post("/login", login);

// Route cần bảo vệ (Private) - Chỉ những người đã đăng nhập mới lấy được danh sách user
router.get("/", authMiddleware, getAllUsers);

export default router;