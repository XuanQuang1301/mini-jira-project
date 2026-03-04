import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();
import { getProjects, createProject, deleteproject, updateProject } from "../controllers/project.controller.js";
import { getProjectById } from "../controllers/project.controller.js";

router.get("/", authMiddleware, getProjects);
router.post("/", authMiddleware, createProject);
router.patch("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteproject);
router.get("/:id", authMiddleware, getProjectById); 
export default router;