import { Router } from "express";
import { createProjectService, updateProjectService, deleteProjectService } from "../services/project.service";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

// Chỉ ai đăng nhập mới được tạo dự án
router.post("/", authMiddleware, async (req: any, res) => {
  const { name, key } = req.body;
  const userId = req.user.userId; // Lấy userId tự động từ Token, không cần truyền từ Body nữa!

  try {
    const project = await createProjectService(name, key, userId);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo dự án" });
  }
});

// Sửa thông tin dự án
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const project = await updateProjectService(Number(id), req.body);
    res.json(project);
});

// Xóa dự án
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await deleteProjectService(Number(id));
    res.json({ message: "Xóa dự án thành công" });
});
export default router;