import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { 
    getProjects, 
    getAllProjects,
    createProject, 
    deleteproject, 
    updateProject, 
    getProjectById,
    joinProjectByCode, 
    approveMember, 
    getPendingMembers, 
    getProjectMembers,
    inviteMemberByEmail,
    removeMember,
    getMyProjects
} from "../controllers/project.controller";
import {
    getTaskByProject,
    createTask,
    deleteTask,
    updateTaskAssignee,
    updateTaskStatus,
    updateTask,
    getMyTasks
} from "../controllers/task.controller";
import {
    getComments,
    addComment
} from "../controllers/comment.controller";

const router = Router();

// --- Tác vụ của riêng user / admin (Cần đặt lên đầu để không bị nhầm với :id) ---
router.get("/my", authMiddleware, getMyProjects);
router.get("/all", authMiddleware, getAllProjects);
router.get("/tasks/my-tasks", authMiddleware, getMyTasks);

// --- CƠ BẢN (CRUD) ---
router.post("/create", authMiddleware, createProject);
router.delete("/delete/:id", authMiddleware, deleteproject);
router.patch("/:id", authMiddleware, updateProject);

// --- THÀNH VIÊN & PHÊ DUYỆT ---
router.post("/join", authMiddleware, joinProjectByCode);
router.post("/approve", authMiddleware, approveMember);
router.get("/:id/pending", authMiddleware, getPendingMembers);
router.get("/:id/members", authMiddleware, getProjectMembers);
router.post("/:id/members", authMiddleware, inviteMemberByEmail);
router.delete("/:id/members/:memberId", authMiddleware, removeMember);

// --- TASKS (Nested trong Project) ---
router.get("/:projectId/tasks", authMiddleware, getTaskByProject);
router.post("/:projectId/tasks", authMiddleware, createTask);
router.delete("/:projectId/tasks/:id", authMiddleware, deleteTask);
router.patch("/:projectId/tasks/:id/assignee", authMiddleware, updateTaskAssignee);
router.patch("/:projectId/tasks/:id/status", authMiddleware, updateTaskStatus);
router.put("/:projectId/tasks/:id", authMiddleware, updateTask);

// --- COMMENTS (Nested trong Task của Project) ---
router.get("/:projectId/tasks/:taskId/comments", authMiddleware, getComments);
router.post("/:projectId/tasks/:taskId/comments", authMiddleware, addComment);

// --- Lấy chi tiết dự án (để ở cuối cùng để tránh override các route khác) ---
router.get("/:id", authMiddleware, getProjectById);

export default router;