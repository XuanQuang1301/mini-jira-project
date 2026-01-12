import { Request, Response } from "express";
import { createTaskService, updateTaskStatusService, deleteTaskService } from "../services/task.service";

// 1. Tạo Task mới
export const createTask = async (req: any, res: Response) => {
    try {
        // reporterId lấy từ user đang đăng nhập qua authMiddleware
        const reporterId = req.user.id; 
        
        // Gộp data từ body và reporterId để truyền vào service
        const taskData = { ...req.body, reporterId };
        
        const task = await createTaskService(taskData);
        res.status(201).json(task);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 2. Cập nhật trạng thái Task (Có ghi Log lịch sử)
export const updateTaskStatus = async (req: any, res: Response) => {
    try {
        const { id } = req.params; // ID của task từ URL
        const { status } = req.body; // Trạng thái mới (TODO, IN_PROGRESS, DONE)
        const userId = req.user.id; // Người thực hiện thay đổi

        // Gọi service với đúng thứ tự tham số: taskId, userId, newStatus
        const updatedTask = await updateTaskStatusService(Number(id), userId, status);
        
        if (!updatedTask) {
            return res.status(404).json({ error: "Không tìm thấy Task để cập nhật" });
        }
        
        res.json(updatedTask);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Xóa Task (Tự động xóa History & Comments nhờ Cascade)
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const deletedTask = await deleteTaskService(Number(id));
        
        if (!deletedTask) {
            return res.status(404).json({ error: "Task không tồn tại hoặc đã bị xóa trước đó" });
        }

        res.json({ 
            message: "Xóa task và các dữ liệu liên quan thành công",
            data: deletedTask 
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};