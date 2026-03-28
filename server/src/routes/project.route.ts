import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { 
    getProjects, 
    createProject, 
    deleteproject, 
    updateProject, 
    getProjectById,
    joinProjectByCode, 
    approveMember, 
    getPendingMembers, 
    getProjectMembers
} from "../controllers/project.controller.js";
const router = Router();

// --- NHÓM ROUTE CƠ BẢN (CRUD) ---
// Lấy danh sách dự án của tôi (Đã duyệt)
router.get("/", authMiddleware, getProjects);

// Tạo dự án mới
router.post("/", authMiddleware, createProject);

// Lấy chi tiết 1 dự án
router.get("/:id", authMiddleware, getProjectById); 

// Cập nhật thông tin dự án
router.patch("/:id", authMiddleware, updateProject);

// Xóa dự án
router.delete("/:id", authMiddleware, deleteproject);

// --- NHÓM ROUTE THÀNH VIÊN & PHÊ DUYỆT ---

// Thành viên tự nhập mã để xin gia nhập (Tạo bản ghi PENDING)
router.post("/join", authMiddleware, joinProjectByCode);

// Manager duyệt thành viên (Chuyển PENDING -> MEMBER)
router.post("/approve", authMiddleware, approveMember);

router.get("/:projectId/pending", authMiddleware, getPendingMembers);

router.get("/:id/members", authMiddleware, getProjectMembers);
export default router;