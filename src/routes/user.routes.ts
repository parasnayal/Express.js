import { Router } from "express";

import {
  createUserController,
  getAllUserListController,
  getTasksByUserIdController,
  getTasksCountByUserIdController,
} from "../controllers/user.controller.ts";

const userRouter = Router();

userRouter.get("/", getAllUserListController);
userRouter.post("/", createUserController);
userRouter.get("/:userId/tasks", getTasksByUserIdController);
userRouter.get("/:userId/taskCount", getTasksCountByUserIdController);

export default userRouter;
