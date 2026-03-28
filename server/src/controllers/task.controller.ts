import { Request, Response } from "express";
import { 
    createTaskService, 
    updateTaskStatusService, 
    deleteTaskService, 
    getTaskbyProjectIdService, 
    getMyTasksService, 
    getTaskByIdService, 
    updateTaskService, updateTaskAssignService
} from "../services/task.service";

// 1. Tạo Task mới
export const createTask = async (req: any, res: any) => {
    try {
        const reporterId = req.user?.userId || req.user?.id || req.userId;
        
        if (!reporterId) {
            return res.status(401).json({ error: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại." });
        }

        const taskData = { 
            ...req.body, 
            reporterId: Number(reporterId) 
        }; 

        if (taskData.dueDate) {
            taskData.dueDate = new Date(taskData.dueDate);
        }

        const task = await createTaskService(taskData);
        return res.status(201).json(task);

    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

// 2. Cập nhật trạng thái Task (Kéo thả Kanban)
export const updateTaskStatus = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.userId || req.user?.id; // Lấy ID người thực hiện

        // Gọi service: taskId, userId, newStatus
        const updatedTask = await updateTaskStatusService(Number(id), Number(userId), status);
        
        if (!updatedTask) {
            return res.status(404).json({ error: "Không tìm thấy Task để cập nhật" });
        }
        
        res.json(updatedTask);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Xóa Task
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedTask = await deleteTaskService(Number(id));
        
        if (!deletedTask) {
            return res.status(404).json({ error: "Task không tồn tại" });
        }

        res.json({ message: "Xóa thành công", data: deletedTask });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Lấy Task theo Project
export const getTaskByProject = async (req: any, res: any) => {
    try {
        const { projectId } = req.params; 
        const tasks = await getTaskbyProjectIdService(Number(projectId)); 
        return res.status(200).json(tasks); 
    } catch (error: any) {
        return res.status(500).json({ error: "Lỗi lấy danh sách Task", details: error.message });
    }
};

// 5. Lấy Task cá nhân (SỬA LỖI TYPO 'useId' -> 'userId')
export const getMyTasks = async (req: any, res: any) => {
    try {    
        const userId = req.user?.userId || req.user?.id || req.userId;
        
        // Gọi đúng tên hàm Service: getMyTasksService
        const myTasks = await getMyTasksService(Number(userId)); 
        return res.status(200).json(myTasks); 
    } catch (error: any) {    
        return res.status(500).json({ error: "Lỗi lấy công việc cá nhân", details: error.message }); 
    }
};

// 6. Lấy chi tiết Task theo ID
export const getTaskById = async (req: any, res: any) => {
    try {
        const taskId = Number(req.params.id); 
        const task = await getTaskByIdService(taskId); 
        if (!task) {
            return res.status(404).json({ error: "Không tìm thấy Task" });
        }
        return res.status(200).json(task); 
    } catch (error: any) {
        return res.status(500).json({ error: "Lỗi máy chủ khi lấy chi tiết task" });
    }
};

// 7. Cập nhật nội dung Task
export const updateTask = async (req: any, res: any) => {
    try {
        const taskId = Number(req.params.id); 
        const updateData = req.body; 

        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }

        const updatedTask = await updateTaskService(taskId, updateData);
        
        if (!updatedTask) {
            return res.status(404).json({ error: "Không tìm thấy công việc để cập nhật." });
        }  
        return res.status(200).json(updatedTask);  
    } catch (error: any) {
        return res.status(500).json({ error: "Lỗi khi cập nhật công việc" });
    }
};
export const updateTaskAssignee = async (req: any, res: any) => {
    try {
        const {id} = req.params; 
        const {assigneeId} = req.body; 
        const taskId = Number(id); 
        const cleanAssigneeId = assigneeId ? Number(assigneeId) : null; 
        if(isNaN(taskId)){
            return res.return(400).json({error: "Task ID khong hop le"})
        }
        const updatedTask = await updateTaskAssignService(taskId, cleanAssigneeId); 
        if(updatedTask.length === 0){
            return res.status(404).json({ error: "Không tìm thấy công việc để giao!" });
        }
        return res.status(200).json({message: "Giao việc thành công!",
            task: updatedTask[0]})
    }catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}