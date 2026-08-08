import { Router } from "express";
import { getComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/task/:taskId", authMiddleware, getComments); 
router.post("/", authMiddleware, addComment);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);

export default router;