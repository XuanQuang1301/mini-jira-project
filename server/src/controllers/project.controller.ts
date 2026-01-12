import { getAllProjectsService, createProjectService, deleteProjectService } from "../services/project.service.js";

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