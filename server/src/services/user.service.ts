import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 

export const loginUserService = async (email: string, password: string) => {
  // 1. Tìm user theo email
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new Error("Email không tồn tại");

  // 2. Kiểm tra password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Mật khẩu không đúng");

  // 3. Tạo JWT Token (Thẻ bài)
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "bi_mat_jira",
    { expiresIn: "1d" }
  );

  return { user: { id: user.id, name: user.name }, token };
}
export const createUserService = async (data: any) => {
  // Mã hóa mật khẩu trước khi lưu
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  return await db.insert(users).values({
    ...data,
    password: hashedPassword,
  }).returning();
};

export const getAllUsersService = async () => {
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatarUrl: users.avatarUrl
  }).from(users);
};