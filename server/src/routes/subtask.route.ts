import { Router } from "express";
import * as subTaskController from "../controllers/subtask.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/task/:taskId", authMiddleware, subTaskController.getSubTask);
router.post("/", authMiddleware, subTaskController.addSubTask);
router.patch("/:id", authMiddleware, subTaskController.toggleSubTask);
router.delete("/:id", authMiddleware, subTaskController.deleteSubTask);

export default router;