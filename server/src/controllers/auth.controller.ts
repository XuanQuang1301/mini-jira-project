import { Request, Response } from "express";
import { createUserService, loginUserService } from "../services/user.service";

export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await createUserService(req.body);
        res.status(201).json({
            message: "Đăng ký thành công!",
            user: newUser
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Email đã tồn tại" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUserService(email, password);
        res.status(200).json({
            message: "Đăng nhập thành công!",
            ...result
        });
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Sai tài khoản hoặc mật khẩu" });
    }
};