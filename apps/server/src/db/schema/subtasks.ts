import { pgTable, integer, text, timestamp ,serial, boolean} from "drizzle-orm/pg-core";
import {tasks} from './tasks'; 
export const subTasks = pgTable("sub_tasks", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .references(() => tasks.id, { onDelete: "cascade" }) 
    .notNull(),
  content: text("content").notNull(), 
  isDone: boolean("is_done").default(false).notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});