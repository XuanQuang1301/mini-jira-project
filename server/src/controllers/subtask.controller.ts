import {Request, Response} from "express"; 
import * as subTaskService from "../services/subtask.service"; 
export const getSubTask = async (req: Request, res: Response) => {
    try {
        const {taskId} = req.params; 
        const data = await subTaskService.getSubTaskService(Number(taskId)); 
        res.status(200).json(data); 
    }catch(error: any){
        res.status(500).json({error: error.message}); 
    }
}
// subtask.controller.ts
export const addSubTask = async (req: Request, res: Response) => {
    try {
        const taskId = req.body.taskId || req.body.task_id;
        const { content } = req.body;

        if (!taskId || isNaN(Number(taskId))) {
            return res.status(400).json({ error: "Mã công việc (taskId) không hợp lệ hoặc bị thiếu!" });
        }
        const data = await subTaskService.createSubTaskService(Number(taskId), content);
        res.status(201).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const toggleSubTask = async (req: Request, res: Response) => {
    try {
        const {id} = req.params; 
        const {isDone} = req.body; 
        const data = await subTaskService.toggeleSubTaskService(Number(id), isDone); 
        res.status(200).json(data); 
    }catch (error: any){
        res.status(400).json({error: error.message}); 
    }
}
export const deleteSubTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await subTaskService.deleteSubTaskService(Number(id));
        res.status(200).json({ message: "Đã xóa đầu việc" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};