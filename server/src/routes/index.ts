import { Router } from "express";
import userRouter from "./user.route";
import projectRouter from "./project.route";
import taskRouter from "./task.route";
import commentRouter from "./comment.route";
import authRouter from "./auth.route";
import subTask from "./subtask.route"; 
const rootRouter = Router();

rootRouter.use("/users", userRouter);
rootRouter.use("/project", projectRouter);
rootRouter.use("/tasks", taskRouter);
rootRouter.use("/comments", commentRouter);
rootRouter.use("/subtasks", subTask); 
rootRouter.use("/auth", authRouter);

export default rootRouter;