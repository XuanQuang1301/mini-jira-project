import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema.ts", // Đường dẫn trỏ đến file tổng hợp schema
  out: "./drizzle",             // Nơi chứa các file migration (sẽ tự tạo)
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});