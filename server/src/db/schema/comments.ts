import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";
import { users } from "./users";
export const comments = pgTable("comments", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  taskId: integer().references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  userId: integer().references(() => users.id).notNull(),
  content: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});