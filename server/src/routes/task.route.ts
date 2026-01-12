import { Router } from "express";
import { createTask, updateTaskStatus, deleteTask } from "../controllers/task.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus); 
router.delete("/:id", authMiddleware, deleteTask);

export default router;