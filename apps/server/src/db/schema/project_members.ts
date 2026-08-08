import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import {projects} from "./projects";
export const projectMembers = pgTable("project_members", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  projectId: integer().references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: integer().references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text().notNull().default("MEMBER"), // 'OWNER', 'ADMIN', 'MEMBER', 'VIEWER'
  joinedAt: timestamp().defaultNow().notNull(),
});