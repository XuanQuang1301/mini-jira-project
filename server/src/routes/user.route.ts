import { Router } from "express";
import { register, login, getAllUsers, deleteUser } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", authMiddleware, getAllUsers);  
router.delete("/:id", authMiddleware, deleteUser);
export default router;