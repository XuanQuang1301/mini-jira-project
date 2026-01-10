import { pgTable, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";
import { doublePrecision } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  title: text().notNull(),
  description: text(),
  status: text().notNull().default("TODO"), // 'BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'
  priority: text().notNull().default("MEDIUM"), // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  // position dùng số thực để khi chèn task vào giữa 2 task khác chỉ cần lấy trung bình cộng
  position: doublePrecision().notNull().default(0), 
  // --- PHẦN CẦN BỔ SUNG ---
  progress: integer().default(0).notNull(), // Phần trăm hoàn thành (0-100%)
  estimatedHours: doublePrecision().default(0), // Thời gian dự kiến (giờ)
  actualHours: doublePrecision().default(0), // Thời gian thực tế đã làm (giờ)
  
  startedAt: timestamp(), // Thời điểm bắt đầu làm (khi chuyển sang IN_PROGRESS)
  completedAt: timestamp(), // Thời điểm hoàn thành thực tế (khi chuyển sang DONE)
  // ------------------------
  projectId: integer().references(() => projects.id, { onDelete: "cascade" }).notNull(),
  assigneeId: integer().references(() => users.id), // Người được giao
  reporterId: integer().references(() => users.id).notNull(), // Người tạo task
  
  dueDate: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
});