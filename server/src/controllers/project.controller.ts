import { Request, Response } from "express";
import { getAllProjectsService, createProjectService, deleteProjectService, updateProjectService, getProjectByIdService } from "../services/project.service.js";
import { db } from "../db/index.js";

export const getProjects = async (req: any, res: any) => {
  try {
    const userId = req.user.id || req.user.userId; // Lấy từ Auth Middleware
    const data = await getAllProjectsService(userId);
    res.json(data);
  } catch (error: any) {
    console.log("Loi backend", error);  
    res.status(500).json({ error: error.message });
  }
};
export const createProject = async (req: any, res: any) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name, key, description } = req.body;
    const newProject = await createProjectService(name, key, description, userId);
    
    return res.status(201).json(newProject);
  } catch (error: any) {
    console.error("Lỗi Controller:", error);
    return res.status(400).json({ error: error.message });
  }
};
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
export const getProjectById = async (req: any, res: any)=> {
  try{
    const {id} = req.params; 
    const project = await getProjectByIdService(Number(id)); 
    if(!project){
      return res.status(404).json({error: "Không tìm thấy dự án"})
    }
    return res.status(200).json(project); 
  }catch(error: any) {
    return res.status(500).json({error: error.message}); 
  }
}