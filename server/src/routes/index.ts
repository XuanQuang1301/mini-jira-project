import { Router } from "express";
import userRouter from "./user.route";
import projectRouter from "./project.route";
import taskRouter from "./task.route";
import commentRouter from "./comment.route";
import router from "./user.route";
import subTask from "./subtask.route"; 
const rootRouter = Router();

rootRouter.use("/users", userRouter);
rootRouter.use("/projects", projectRouter);
rootRouter.use("/tasks", taskRouter);
rootRouter.use("/comments", commentRouter);
rootRouter.use("/subtasks", subTask); 
export default rootRouter;