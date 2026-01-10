import { db } from "../db";
import { tasks, taskHistory } from "../db/schema"; 
import { eq } from "drizzle-orm";

export const createTaskService = async (data: any) => {
  return await db.transaction(async (tx) => {
    // 1. Tạo task mới
    const [newTask] = await tx.insert(tasks).values(data).returning();

    // 2. Ghi log khởi tạo (Lưu ý: tên cột phải khớp với schema của bạn)
    await tx.insert(taskHistory).values({
      taskId: newTask.id,
      userId: data.reporterId,
      oldStatus: null, // Sửa từ fromStatus thành oldStatus nếu schema bạn đặt vậy
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
    // 1. Kiểm tra task có tồn tại không (tùy chọn nhưng nên có)
    
    // 2. Thực hiện xóa
    // Lưu ý: Vì ta đã đặt ON DELETE CASCADE trong Schema cho taskHistory và comments,
    // nên khi xóa task, các dữ liệu liên quan sẽ tự động bị xóa sạch.
    const result = await tx.delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();

    return result[0];
  });
};