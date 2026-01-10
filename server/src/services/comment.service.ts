import { db } from "../db";
import { comments } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { users } from "../db/schema";

export const getCommentsByTaskService = async (taskId: number) => {
  return await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id)) // Join để lấy tên người comment
    .where(eq(comments.taskId, taskId))
    .orderBy(desc(comments.createdAt)); // Comment mới nhất hiện lên đầu
};
export const addCommentService = async (taskId: number, userId: number, content: string) => {
  return await db.insert(comments).values({
    taskId,
    userId,
    content,
  }).returning();
};
// Xóa comment
export const deleteCommentService = async (commentId: number, userId: number) => {
  return await db.delete(comments)
    .where(eq(comments.id, commentId))
    // .where(eq(comments.userId, userId)) // Chỉ chủ nhân mới được xóa (Logic phân quyền)
    .returning();
};

// Sửa comment
export const updateCommentService = async (commentId: number, content: string) => {
  return await db.update(comments)
    .set({ content }) // Giả sử bạn có cột updatedAt
    .where(eq(comments.id, commentId))
    .returning();
};