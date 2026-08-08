import { Request, Response } from "express";
import * as projectService from "../services/project.service";

// 1. Lấy tất cả dự án (Dùng cho Admin hoặc Dashboard tổng)
export const getProjects = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user.userId;
    const data = await projectService.getMyProjectsService(userId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 1b. Lấy tất cả dự án trong hệ thống dành cho Admin
export const getAllProjects = async (req: any, res: Response) => {
  try {
    const data = await projectService.getAllProjectsService();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Tạo dự án mới
export const createProject = async (req: any, res: any) => {
    try {
        let { name, key, description, ownerId } = req.body;
        if (!ownerId) {
            ownerId = req.user?.id || req.user?.userId;
        }
        if (!ownerId) {
            return res.status(400).json({ error: "Thiếu ID người tạo dự án! Vui lòng đăng nhập lại." });
        }
        const cleanOwnerId = Number(ownerId.toString().replace(/,/g, ''));
        if (isNaN(cleanOwnerId)) {
            return res.status(400).json({ error: "ID người tạo không hợp lệ (NaN)!" });
        }
        const newProject = await projectService.createProjectService(
            name, 
            key, 
            description, 
            cleanOwnerId
        );

        return res.status(201).json(newProject);
    } catch (error: any) {
        console.error("Lỗi tại createProject Controller:", error.message);
        return res.status(400).json({ error: error.message });
    }
};

// 3. Xóa dự án
export const deleteproject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await projectService.deleteProjectService(Number(id));
    res.json({ message: "Xóa dự án thành công" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Cập nhật dự án
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedProject = await projectService.updateProjectService(Number(id), updateData);
    
    if (!updatedProject) {
      return res.status(404).json({ error: "Dự án không tồn tại" });
    }
    res.status(200).json(updatedProject);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// 5. Lấy dự án theo ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectByIdService(Number(id));
    if (!project) {
      return res.status(404).json({ error: "Không tìm thấy dự án" });
    }
    return res.status(200).json(project);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 6. Lấy dự án của tôi (Đã lọc PENDING)
export const getMyProjects = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user.userId;
    const data = await projectService.getMyProjectsService(userId);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Thành viên xin gia nhập bằng mã Code
export const joinProjectByCode = async (req: any, res: Response) => {
  try {
    const { projectCode } = req.body;
    const userId = req.user.id || req.user.userId;

    const result = await projectService.joinProjectByCodeService(projectCode, userId);
    
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Manager phê duyệt thành viên
export const approveMember = async (req: any, res: Response) => {
  try {
    const { memberRecordId } = req.body;
    const result = await projectService.approveMemberService(Number(memberRecordId));
    
    res.status(200).json({ message: "Đã phê duyệt thành viên vào dự án!", data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingMembers = async (req: any, res: any) => {
    try {
        const projectId = Number(req.params.id || req.params.projectId); 
        if (isNaN(projectId)) {
            return res.status(400).json({ error: "Project ID phải là một số (NaN error)" });
        }
        const data = await projectService.getPendingMembersService(Number(projectId));
        
        console.log(`[BACKEND] Dự án ${projectId} tìm thấy ${data.length} yêu cầu chờ duyệt.`);
        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

//lấy thành viên trong dự án
export const getProjectMembers = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const data = await projectService.getProjectMemberService(Number(id));
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const inviteMemberByEmail = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Vui lòng cung cấp email!" });
        }

        const result = await projectService.inviteMemberByEmailService(Number(id), email);
        if (result.error) {
            return res.status(result.status || 400).json({ error: result.error });
        }
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const removeMember = async (req: Request, res: Response) => {
    try {
        const { id, memberId } = req.params;
        await projectService.removeMemberService(Number(id), Number(memberId));
        res.status(200).json({ message: "Đã xóa thành viên khỏi dự án" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};