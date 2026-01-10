import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(), // Sẽ lưu hash từ bcrypt
  avatarUrl: text(),
  createdAt: timestamp().defaultNow().notNull(),
});