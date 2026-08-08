import { db } from "../db";
import { notifications } from "../db/schema/notifications";
import { eq, desc, and, sql } from "drizzle-orm";

// Ensure table exists safely on startup
export const initNotificationTable = async () => {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'INFO',
        link TEXT,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error("Error creating notifications table:", err);
  }
};

// Run init once
initNotificationTable();

// 1. Tạo thông báo mới
export const createNotificationService = async (data: {
  userId: number;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) => {
  try {
    if (!data.userId) return null;
    const [newNotif] = await db.insert(notifications).values({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || "INFO",
      link: data.link || null,
      isRead: false,
    }).returning();
    return newNotif;
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// 2. Lấy danh sách thông báo của user
export const getUserNotificationsService = async (userId: number) => {
  try {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// 3. Đánh dấu một thông báo đã đọc
export const markNotificationAsReadService = async (notificationId: number, userId: number) => {
  try {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();
    return updated;
  } catch (error: any) {
    console.error("Error marking notification read:", error);
    return null;
  }
};

// 4. Đánh dấu tất cả thông báo là đã đọc
export const markAllNotificationsAsReadService = async (userId: number) => {
  try {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
      .returning();
  } catch (error: any) {
    console.error("Error marking all read:", error);
    return [];
  }
};
