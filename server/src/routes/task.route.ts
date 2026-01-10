import { Router } from "express";
import { createTaskService, updateTaskStatusService, deleteTaskService } from "../services/task.service";

const router = Router();

// Tạo task mới
router.post("/", async (req, res) => {
  try {
    const task = await createTaskService(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Không thể tạo task" });
  }
});

// Cập nhật trạng thái (Kèm ghi log lịch sử)
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { userId, newStatus } = req.body;
  try {
    const updatedTask = await updateTaskStatusService(Number(id), userId, newStatus);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
  }
});
// Xóa một task theo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await deleteTaskService(Number(id));
    
    if (!deletedTask) {
      return res.status(404).json({ error: "Không tìm thấy công việc để xóa" });
    }

    res.json({ message: "Đã xóa công việc thành công", deletedTask });
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống khi xóa công việc" });
  }
});
export default router;