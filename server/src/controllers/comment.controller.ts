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
        // Lấy ID chuẩn xác từ Token
        const userId = req.user?.id || req.user?.userId; 

        if (!content) {
            return res.status(400).json({ error: "Nội dung bình luận không được để trống" });
        }

        // MySQL không có .returning() nên không cần hứng [newComment]
        await addCommentService(Number(taskId), userId, content);
        res.status(201).json({ message: "Thêm bình luận thành công" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Cập nhật nội dung bình luận
export const updateComment = async (req: any, res: Response) => {
    try {
        const { id } = req.params; // Đây là ID của comment
        const { content } = req.body;
        const userId = req.user?.id || req.user?.userId;

        if (!content) {
            return res.status(400).json({ error: "Nội dung không được để trống" });
        }

        // Đã sửa: Truyền đủ 3 tham số để phân quyền bảo mật
        await updateCommentService(Number(id), userId, content); 
        
        res.status(200).json({ message: "Đã cập nhật bình luận" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 4. Xóa bình luận
export const deleteComment = async (req: any, res: Response) => {
    try {
        const { id } = req.params; // ID của comment
        const userId = req.user?.id || req.user?.userId;
        
        await deleteCommentService(Number(id), userId);
        
        res.status(200).json({ message: "Đã xóa bình luận thành công" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};