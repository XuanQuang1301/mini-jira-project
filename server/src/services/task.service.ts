import { db } from "../db";
import { tasks, taskHistory } from "../db/schema"; 
import { eq, or } from "drizzle-orm";

export const createTaskService = async (data: any) => {
  return await db.transaction(async (tx) => {
    // 1. Tạo task mới
    const [newTask] = await tx.insert(tasks).values(data).returning();
    await tx.insert(taskHistory).values({
      taskId: newTask.id,
      userId: data.reporterId,
      oldStatus: null, 
      newStatus: data.status || "TODO",
    });

    return newTask;
  });
};

export const updateTaskStatusService = async (taskId: number, userId: number, newStatus: string) => {
  return await db.transaction(async (tx) => {
    // 1. Lấy trạng thái cũ
    const oldTask = await tx.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    const oldStatus = oldTask[0]?.status;

    // 2. Cập nhật task (tự động tính progress nếu là DONE)
    const [updatedTask] = await tx.update(tasks)
      .set({ 
        status: newStatus,
        progress: newStatus === "DONE" ? 100 : undefined,
        completedAt: newStatus === "DONE" ? new Date() : null
      })
      .where(eq(tasks.id, taskId))
      .returning();

    // 3. Lưu lịch sử
    await tx.insert(taskHistory).values({
      taskId,
      userId,
      oldStatus: oldStatus,
      newStatus: newStatus,
    });

    return updatedTask;
  });
};
export const deleteTaskService = async (taskId: number) => {
  return await db.transaction(async (tx) => {
    const result = await tx.delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  });
};
export const getTaskbyProjectIdService = async (projectId : number) => {
  return await db.select()
  .from(tasks)
  .where(eq(tasks.projectId, projectId))
}
export const getMyTaskService = async (useId: number) => {
  return await db.select()
  .from(tasks)
  .where(
    or(
      eq(tasks.assigneeId, useId),
      eq(tasks.reporterId, useId)
    )
  ); 
}