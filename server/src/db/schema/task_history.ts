import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";
export const taskHistory = pgTable("task_history", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  taskId: integer().references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: integer().references(() => users.id).notNull(),
  
  oldStatus: text(),
  newStatus: text().notNull(),
  
  // Lưu lại phần trăm hoàn thành tại thời điểm đó
  progressAtThatTime: integer(), 
  
  changedAt: timestamp().defaultNow().notNull(),
});