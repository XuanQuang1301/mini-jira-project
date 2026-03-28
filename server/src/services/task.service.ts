import { db } from "../db";
import { tasks, taskHistory } from "../db/schema"; 
import { eq, and, or } from "drizzle-orm";

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

    return newTask;
  });
};

// 2. Cập nhật trạng thái (Kéo thả Kanban)
export const updateTaskStatusService = async (taskId: number, userId: number, newStatus: string) => {
  return await db.transaction(async (tx) => {
    const oldTask = await tx.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    const oldStatus = oldTask[0]?.status;

    const [updatedTask] = await tx.update(tasks)
      .set({ 
        status: newStatus,
        progress: newStatus === "DONE" ? 100 : undefined,
        completedAt: newStatus === "DONE" ? new Date() : null
      })
      .where(eq(tasks.id, taskId))
      .returning();

    await tx.insert(taskHistory).values({
      taskId,
      userId,
      oldStatus: oldStatus,
      newStatus: newStatus,
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

// 5. LẤY TASK CỦA TÔI (SỬA LỖI TRỐNG KANBAN)
export const getMyTasksService = async (userId: number) => {
    return await db.select()
        .from(tasks)
        .where(
            or(
                eq(tasks.assigneeId, userId), // Tôi là người làm
                eq(tasks.reporterId, userId)  // Hoặc tôi là người giao (để quản lý)
            )
        ); 
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