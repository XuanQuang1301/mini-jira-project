import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const projects = pgTable("projects", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
  key: text().notNull().unique(), 
  description: text(),
  ownerId: integer().references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp().defaultNow().notNull(),
});