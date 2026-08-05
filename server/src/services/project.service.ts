import { db } from "../db"; 
import { projects, projectMembers, users } from "../db/schema";
import { eq, and, ne, or, sql } from "drizzle-orm";

// 1. TẠO PROJECT (Chủ dự án vào luôn với quyền OWNER)
export const createProjectService = async (name: string, key: string, description: string, ownerId: number) => {
    return await db.transaction(async (tx) => {
        const [newProject] = await tx.insert(projects).values({
            name,
            key: key.trim().toUpperCase(),
            description: description, 
            ownerId: ownerId, 
        }).returning();

        // Thêm người tạo vào bảng projectMembers với quyền OWNER
        await tx.insert(projectMembers).values({
            projectId: newProject.id,
            userId: ownerId,
            role: "OWNER", 
        });
        return newProject; 
    }); 
};

// 2. THAM GIA DỰ ÁN BẰNG MÃ (Sét role là PENDING)
export const joinProjectByCodeService = async (projectKey: string, userId: number) => {
    const [project] = await db.select().from(projects).where(eq(projects.key, projectKey.toUpperCase())).limit(1);
    
    if (!project) return { error: "Mã dự án không tồn tại!", status: 404 };

    // Kiểm tra xem đã tồn tại trong dự án chưa
    const [existing] = await db.select().from(projectMembers)
        .where(and(
            eq(projectMembers.projectId, project.id),
            eq(projectMembers.userId, userId)
        )).limit(1);

    if (existing) {
        if (existing.role === 'PENDING') return { error: "Yêu cầu của bạn đang chờ duyệt!", status: 400 };
        return { error: "Bạn đã là thành viên của dự án này!", status: 400 };
    }

    // Gán role là PENDING để manager thấy trong danh sách chờ duyệt
    await db.insert(projectMembers).values({
        projectId: project.id,
        userId: userId,
        role: "PENDING", 
    });

    return { message: "Đã gửi yêu cầu tham gia dự án thành công!", status: 200 };
};

// 3. LẤY DANH SÁCH CHỜ DUYỆT (Lọc những người có role = PENDING)
export const getPendingMembersService = async (projectId: number) => {
    try {
        const result = await db.select({
            id: projectMembers.id,
            role: projectMembers.role,
            user: {
                id: users.id,
                name: users.name,
                email: users.email
            }
        })
        .from(projectMembers)
        .innerJoin(users, eq(projectMembers.userId, users.id)) 
        .where(and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.role, 'PENDING')
        ));
        console.log(`[DB CHECK] Project ${projectId} found:`, result);
        return result;
    } catch (error: any) {
        console.error("Lỗi Query Drizzle:", error.message);
        throw error;
    }
};

// 4. DUYỆT THÀNH VIÊN (Chuyển role PENDING -> MEMBER)
export const approveMemberService = async (memberRecordId: number) => {
    return await db.update(projectMembers)
        .set({ role: 'MEMBER' })
        .where(eq(projectMembers.id, memberRecordId))
        .returning();
};

// 5. LẤY TẤT CẢ DỰ ÁN CỦA TÔI (Bao gồm dự án tôi tạo hoặc được thêm vào làm thành viên)
export const getMyProjectsService = async (userId: number) => {
    const cleanUserId = Number(userId);

    // Lấy các dự án làm Owner hoặc đã tham gia (Member)
    const list = await db
        .select({
            id: projects.id,
            name: projects.name,
            key: projects.key,
            description: projects.description,
            role: sql<string>`COALESCE(${projectMembers.role}, 'OWNER')`.as('role'),
            ownerId: projects.ownerId,
            createdAt: projects.createdAt
        })
        .from(projects)
        .leftJoin(projectMembers, and(
            eq(projects.id, projectMembers.projectId),
            eq(projectMembers.userId, cleanUserId)
        ))
        .where(
            or(
                eq(projects.ownerId, cleanUserId),
                and(
                    eq(projectMembers.userId, cleanUserId),
                    ne(projectMembers.role, "PENDING")
                )
            )
        );

    // Lọc trùng lặp nếu có
    const uniqueProjectsMap = new Map();
    list.forEach(p => {
        if (!uniqueProjectsMap.has(p.id)) {
            uniqueProjectsMap.set(p.id, p);
        }
    });

    return Array.from(uniqueProjectsMap.values());
};

// 5b. LẤY TẤT CẢ DỰ ÁN TRONG HỆ THỐNG (Dành cho Admin)
export const getAllProjectsService = async () => {
    return await db
        .select({
            id: projects.id,
            name: projects.name,
            key: projects.key,
            description: projects.description,
            ownerId: projects.ownerId,
            ownerName: users.name,
            ownerEmail: users.email,
            createdAt: projects.createdAt
        })
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id));
};

// 6. LẤY DỰ ÁN THEO ID
export const getProjectByIdService = async (projectId: number) => {
    const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1); 
    return result[0]; 
};

// 7. CẬP NHẬT PROJECT
export const updateProjectService = async (projectId: number, data: { name?: string; description?: string }) => {
    const [updatedProject] = await db.update(projects)
        .set(data)
        .where(eq(projects.id, projectId))
        .returning();
    return updatedProject;
};

// 8. XÓA PROJECT
export const deleteProjectService = async (projectId: number) => {
    const [deletedProject] = await db.delete(projects)
        .where(eq(projects.id, projectId))
        .returning();
    return deletedProject;
};
// 9.Lấy danh sách thành viên trong PROJECT 
export const getProjectMemberService = async (projectId: number) => {
    return await db.select({
        id: users.id,
        name: users.name,
        email: users.email
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(and(
        eq(projectMembers.projectId, projectId),
        ne(projectMembers.role, 'PENDING')
    ));
};

// 10. MỜI THÀNH VIÊN BẰNG EMAIL
export const inviteMemberByEmailService = async (projectId: number, email: string) => {
    // Tìm user theo email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
        return { error: "Không tìm thấy người dùng với email này!", status: 404 };
    }

    // Kiểm tra xem đã có trong dự án chưa
    const [existing] = await db.select().from(projectMembers)
        .where(and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, user.id)
        )).limit(1);

    if (existing) {
         return { error: "Người dùng này đã là thành viên (hoặc đang chờ) của dự án!", status: 400 };
    }

    // Gán role là MEMBER
    await db.insert(projectMembers).values({
        projectId: projectId,
        userId: user.id,
        role: "MEMBER", 
    });

    return { message: "Đã thêm thành viên vào dự án thành công!", status: 200, user: user };
};

// 11. XÓA THÀNH VIÊN
export const removeMemberService = async (projectId: number, memberId: number) => {
    return await db.delete(projectMembers)
        .where(and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, memberId)
        ))
        .returning();
};