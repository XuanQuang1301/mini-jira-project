import { pgTable, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";
import { doublePrecision } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  title: text().notNull(),
  description: text(),
  status: text().notNull().default("TODO"), 
  priority: text().notNull().default("MEDIUM"), 
  position: doublePrecision().notNull().default(0), 
  progress: integer().default(0).notNull(), 
  estimatedHours: doublePrecision().default(0), 
  actualHours: doublePrecision().default(0), 
  startedAt: timestamp(), 
  completedAt: timestamp(),
  projectId: integer().references(() => projects.id, { onDelete: "cascade" }).notNull(),
  assigneeId: integer().references(() => users.id), 
  reporterId: integer().references(() => users.id).notNull(),
  
  dueDate: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
});