import { Request, Response } from "express";
import { getAllProjectsService, createProjectService, deleteProjectService, updateProjectService } from "../services/project.service.js";
import { db } from "../db/index.js";

export const getProjects = async (req: any, res: any) => {
  try {
    const userId = req.user.id; // Lấy từ Auth Middleware
    const data = await getAllProjectsService(userId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const createProject = async (req: any, res: any) => {
  try{
    const userId = req.user.id; 
    const {name, key} = req.body; 
    const newProject = await createProjectService(userId, name, key);
    res.status(201).json(newProject);
  }catch(error:any){
    res.status(400).json({error: error.message});
  }
}
export const deleteproject = async (req:any, res: any)=>{
  try{
    const {id} = req.params; 
    await deleteProjectService(Number(id));
    res.json({ message: "Xóa dự án thành công" });
  }catch(error: any){
    res.status(500).json({error: error.message}); 
  }
}; 
export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // Lấy toàn bộ data (name, description...)

        const updatedProject = await updateProjectService(Number(id), updateData);
        
        if (!updatedProject) {
            return res.status(404).json({ error: "Dự án không tồn tại" });
        }

        res.status(200).json(updatedProject);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};