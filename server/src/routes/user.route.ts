import { Router } from "express";
import { 
    register, 
    login, 
    getAllUsers, 
    deleteUser,
    getProfile,
    updateProfile,
    updatePassword,
    updateAvatar,
    lockUser
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/password", authMiddleware, updatePassword);
router.post("/profile/avatar", authMiddleware, updateAvatar);

// User management routes
router.get("/", authMiddleware, getAllUsers);  
router.put("/:userId/lock", authMiddleware, lockUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;