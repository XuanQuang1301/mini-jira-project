import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Bạn chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "bi_mat_jira");
    req.user = decoded; // Lưu thông tin user vào request
    next();
  } catch (err) {
    res.status(401).json({ error: "Token không hợp lệ" });
  }
};