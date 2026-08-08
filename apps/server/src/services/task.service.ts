import { db } from "../db";
import { tasks, taskHistory, projectMembers, projects } from "../db/schema"; 
import { eq, and, or, inArray, ne } from "drizzle-orm";
import { createNotificationService } from "./notification.service";

// 1. Tạo task mới
export const createTaskService = async (data: any) => {
  return await db.transaction(async (tx) => {
    const [newTask] = await tx.insert(tasks).values(data).returning();
    
    // Lưu vào lịch sử task
    await tx.insert(taskHistory).values({
      taskId: newTask.id,
      userId: data.reporterId,
      oldStatus: null, 
      newStatus: data.status || "TODO",
    });

    // Tạo thông báo nếu có người được gán task
    if (newTask.assigneeId && Number(newTask.assigneeId) !== Number(data.reporterId)) {
      createNotificationService({
        userId: Number(newTask.assigneeId),
        title: "Bạn được phân công công việc mới",
        message: `Bạn đã được gán công việc "${newTask.title}" trong dự án #${newTask.projectId}`,
        type: "TASK_ASSIGNED",
        link: `/projects/${newTask.projectId}`,
      });
    }

    return newTask;
  });
};

// 2. Cập nhật trạng thái (Kéo thả Kanban)
export const updateTaskStatusService = async (taskId: number, userId: number, newStatus: string) => {
  return await db.transaction(async (tx) => {
    const oldTask = await tx.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!oldTask || oldTask.length === 0) {
      return null;
    }
    const oldStatus = oldTask[0]?.status;
    const cleanUserId = (!userId || isNaN(userId)) ? (oldTask[0].reporterId || 1) : userId;

    const updateData: any = { 
      status: newStatus,
      completedAt: newStatus === "DONE" ? new Date() : null
    };

    if (newStatus === "DONE") {
      updateData.progress = 100;
    }

    const [updatedTask] = await tx.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    await tx.insert(taskHistory).values({
      taskId,
      userId: cleanUserId,
      oldStatus: oldStatus || null,
      newStatus: newStatus,
      progressAtThatTime: newStatus === "DONE" ? 100 : (oldTask[0].progress || 0)
    });

    return updatedTask;
  });
};

// 3. Xóa Task
export const deleteTaskService = async (taskId: number) => {
  const [result] = await db.delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning();
  return result;
};

// 4. Lấy Task theo Dự án
export const getTaskbyProjectIdService = async (projectId : number) => {
  return await db.select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId));
};

// 5. LẤY TASK CỦA TÔI (Bao gồm task được phân công, tạo ra, hoặc thuộc dự án user tham gia)
export const getMyTasksService = async (userId: number) => {
    // 1. Lấy danh sách projectId mà user tham gia làm thành viên (trừ PENDING)
    const userProjects = await db.select({ projectId: projectMembers.projectId })
        .from(projectMembers)
        .where(and(
            eq(projectMembers.userId, userId),
            ne(projectMembers.role, 'PENDING')
        ));

    const projectIds = userProjects.map(p => p.projectId);

    // 2. Lấy các dự án do user làm chủ sở hữu (Owner)
    const ownerProjects = await db.select({ id: projects.id })
        .from(projects)
        .where(eq(projects.ownerId, userId));

    ownerProjects.forEach(p => {
        if (!projectIds.includes(p.id)) projectIds.push(p.id);
    });

    const conditions = [
        eq(tasks.assigneeId, userId),
        eq(tasks.reporterId, userId)
    ];

    if (projectIds.length > 0) {
        conditions.push(inArray(tasks.projectId, projectIds));
    }

    return await db.select()
        .from(tasks)
        .where(or(...conditions));
};

// 6. LẤY CHI TIẾT TASK 
export const getTaskByIdService = async (taskId: number) => {
  const result = await db.select()
    .from(tasks)
    .where(eq(tasks.id, taskId));
  return result[0]; 
};

// 7. Cập nhật thông tin Task
export const updateTaskService = async (taskId: number, updateData: any) => {
  const [result] = await db.update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId))
    .returning(); 
  return result; 
};

// hàm cập nhật cho assigneeId 
export const updateTaskAssignService = async (taskId: number, assigneeId: number | null) => {
  return await db.update(tasks)
  .set({assigneeId})
  .where(eq(tasks.id, taskId))
  .returning(); 
}