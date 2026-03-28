import { Router } from "express";
import { createTask, updateTaskStatus, deleteTask, getTaskByProject, getMyTasks, getTaskById, updateTask, updateTaskAssignee} from "../controllers/task.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.get("/project/:projectId", authMiddleware, getTaskByProject );
router.post("/", authMiddleware, createTask);
router.get("/my-tasks", authMiddleware, getMyTasks)
router.patch("/:id/status", authMiddleware, updateTaskStatus); 
router.delete("/:id", authMiddleware, deleteTask);
router.get("/:id", authMiddleware, getTaskById); 
router.put("/:id", authMiddleware, updateTask); 
router.patch("/:id/assign", authMiddleware, updateTaskAssignee); 
export default router;