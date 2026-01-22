import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();
import { getProjects, createProject, deleteproject, updateProject } from "../controllers/project.controller.js";


router.get("/", authMiddleware, getProjects);
router.post("/", authMiddleware, createProject);
router.patch("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteproject);
export default router;