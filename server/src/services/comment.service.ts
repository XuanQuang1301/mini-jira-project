import { db } from "../db";
import { comments } from "../db/schema";
import { eq, desc, and  } from "drizzle-orm";
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
  }); 
};
// Xóa comment
export const deleteCommentService = async (commentId: number, userId: number) => {
  return await db.delete(comments)
    .where(
        and( // Gộp 2 điều kiện: Vừa phải đúng ID comment, vừa phải đúng User đó tạo
            eq(comments.id, commentId),
            eq(comments.userId, userId) 
        )
    );
};

// Sửa comment
export const updateCommentService = async (commentId: number, userId: number, content: string) => {
  return await db.update(comments)
    .set({ content })
    .where(
        and(
            eq(comments.id, commentId),
            eq(comments.userId, userId) // Bắt buộc ID người gửi yêu cầu phải khớp với người tạo
        )
    );
};