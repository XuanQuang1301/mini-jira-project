import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();
import { getProjects, createProject, deleteproject, updateProject } from "../controllers/project.controller.js";

// Lấy tất cả dự án của người dùng
router.get("/", authMiddleware, getProjects);
// Chỉ ai đăng nhập mới được tạo dự án
router.post("/", authMiddleware, createProject);
// Sửa thông tin dự án
router.patch("/:id", authMiddleware, updateProject);
// Xóa dự án
router.delete("/:id", authMiddleware, deleteproject);
export default router;