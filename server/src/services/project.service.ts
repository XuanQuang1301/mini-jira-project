import { db } from "../db"; 
import { projects, projectMembers } from "../db/schema";
import { eq } from "drizzle-orm";

// 1. Logic Tạo Project (Giữ nguyên của bạn và thêm .trim())
export const createProjectService = async (name: string, key: string, ownerId: number) => {
    return await db.transaction(async (tx) => {
        const [newProject] = await tx.insert(projects).values({
            name,
            key: key.trim().toUpperCase(),
            ownerId
        }).returning();

        await tx.insert(projectMembers).values({
            projectId: newProject.id,
            userId: ownerId,
            role: "OWNER",
        });
        return newProject; 
    }); 
};

// 2. Logic Cập nhật Project (Update)
export const updateProjectService = async (projectId: number, data: { name?: string; description?: string }) => {
    const [updatedProject] = await db.update(projects)
        .set(data)
        .where(eq(projects.id, projectId))
        .returning();
    return updatedProject;
};

// 3. Logic Xóa Project (Delete)
export const deleteProjectService = async (projectId: number) => {
    return await db.transaction(async (tx) => {
        // Do có ON DELETE CASCADE nên khi xóa project, 
        // các bảng projectMembers, tasks, taskHistory liên quan sẽ tự động bị xóa theo.
        const [deletedProject] = await tx.delete(projects)
            .where(eq(projects.id, projectId))
            .returning();
        return deletedProject;
    });
};

export const getAllProjectsService = async (userId: number) => {
  return await db.select().from(projects).where(eq(projects.ownerId, userId));
};