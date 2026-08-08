import { Request, Response } from "express";
import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService
} from "../services/notification.service";

export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.userId || req.user?.id || req.userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = await getUserNotificationsService(userId);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.userId || req.user?.id || req.userId);
    const notifId = Number(req.params.id);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await markNotificationAsReadService(notifId, userId);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.userId || req.user?.id || req.userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await markAllNotificationsAsReadService(userId);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
