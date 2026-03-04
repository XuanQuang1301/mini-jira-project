import { Router } from "express";
import { createTask, updateTaskStatus, deleteTask, getTaskByProject, getMyTasks} from "../controllers/task.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.get("/project/:projectId", authMiddleware, getTaskByProject );
router.post("/", authMiddleware, createTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus); 
router.delete("/:id", authMiddleware, deleteTask);
router.get("/my-tasks", authMiddleware, getMyTasks)
export default router;