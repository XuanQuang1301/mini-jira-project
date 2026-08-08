import { pgTable, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable("notifications", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer().notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text().notNull(),
  message: text().notNull(),
  type: text().notNull().default("INFO"), // 'TASK_ASSIGNED', 'PROJECT_INVITED', 'SYSTEM'
  link: text(), // e.g. '/projects/1'
  isRead: boolean().default(false).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
