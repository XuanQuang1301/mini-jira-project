import { Router } from "express";
import userRouter from "./user.route";
import projectRouter from "./project.route";
import taskRouter from "./task.route";

const rootRouter = Router();

rootRouter.use("/users", userRouter);
rootRouter.use("/projects", projectRouter);
rootRouter.use("/tasks", taskRouter);

export default rootRouter;