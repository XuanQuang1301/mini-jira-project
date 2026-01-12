import { Request, Response } from "express";
import { 
    getCommentsByTaskService, 
    addCommentService, 
    deleteCommentService, 
    updateCommentService 
} from "../services/comment.service";

// 1. Lấy danh sách bình luận của một Task
export const getComments = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const data = await getCommentsByTaskService(Number(taskId));
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Thêm bình luận mới
export const addComment = async (req: any, res: Response) => {
    try {
        const { taskId, content } = req.body;
        const userId = req.user.id; // Lấy từ authMiddleware

        if (!content) {
            return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
        }

        const [newComment] = await addCommentService(Number(taskId), userId, content);
        res.status(201).json(newComment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Cập nhật nội dung bình luận
export const updateComment = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        
        // Gọi service cập nhật
        const [updatedComment] = await updateCommentService(Number(id), content);
        
        if (!updatedComment) {
            return res.status(404).json({ error: "Không tìm thấy bình luận" });
        }
        
        res.json(updatedComment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 4. Xóa bình luận
export const deleteComment = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Lưu ý: Trong Service của bạn đang comment dòng check userId, 
        // nhưng thực tế nên check ở đây hoặc mở comment trong service để bảo mật
        const deleted = await deleteCommentService(Number(id), userId);
        
        if (!deleted || deleted.length === 0) {
            return res.status(404).json({ error: "Xóa thất bại. Bình luận không tồn tại." });
        }

        res.json({ message: "Đã xóa bình luận thành công" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};