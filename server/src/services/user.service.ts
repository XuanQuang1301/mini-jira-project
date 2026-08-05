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

  return { user: { id: user.id, name: user.name, email: user.email }, token };
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
    avatarUrl: users.avatarUrl,
    isLocked: users.isLocked
  }).from(users);
};

export const getUserProfileService = async (userId: number) => {
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatarUrl: users.avatarUrl,
    isLocked: users.isLocked,
    createdAt: users.createdAt
  }).from(users).where(eq(users.id, userId)).limit(1);
  return user;
};

export const updateUserProfileService = async (userId: number, data: { name?: string; email?: string }) => {
  const [updated] = await db.update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    });
  return updated;
};

export const updateUserPasswordService = async (userId: number, passwordData: { oldPassword?: string; newPassword?: string }) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Người dùng không tồn tại");

  if (passwordData.oldPassword && passwordData.newPassword) {
    const isMatch = await bcrypt.compare(passwordData.oldPassword, user.password);
    if (!isMatch) throw new Error("Mật khẩu cũ không chính xác");
    
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
    return { message: "Đổi mật khẩu thành công" };
  }
  throw new Error("Dữ liệu không hợp lệ");
};

export const updateUserAvatarService = async (userId: number, avatarUrl: string) => {
  const [updated] = await db.update(users)
    .set({ avatarUrl })
    .where(eq(users.id, userId))
    .returning({ avatarUrl: users.avatarUrl });
  return updated;
};

export const lockUserService = async (userId: number, isLocked: boolean) => {
  const [updated] = await db.update(users)
    .set({ isLocked })
    .where(eq(users.id, userId))
    .returning({ id: users.id, isLocked: users.isLocked });
  return updated;
};