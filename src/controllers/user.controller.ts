import { type Request, type Response } from "express";
import { userService } from "../services/user.service.ts";
import { parseTaskId } from "../utils/paraseTaskId.ts";

export const getAllUserListController = async (req: Request, res: Response) => {
  const user = await userService.getAllUsers();

  res.status(200).json({
    success: true,
    data: user,
    message: "Data fetched successfully",
  });
};

export const createUserController = async (req: Request, res: Response) => {
  const { name, email } = req.body || {};

  const user = await userService.createUser({ name: name.trim(), email });

  res.status(200).json({
    success: true,
    data: user,
    message: "User created Successfully.",
  });
};

export const getTasksByUserIdController = async (req: Request, res: Response) => {
  const { userId } = req.params || {};

  const id = parseTaskId(userId as string);

  const tasksList = await userService.getTasksByUserId(Number(id));

  res.status(200).json({
    success: true,
    data: tasksList,
    message: "Data fetched successfully.",
  });
};

export const getTasksCountByUserIdController = async (req: Request, res: Response) => {
  const { userId } = req.params || {};

  const id = parseTaskId(userId as string);

  const tasksList = await userService.getUsersWithTaskCount(Number(id));

  res.status(200).json({
    success: true,
    data: tasksList,
    message: "Data fetched successfully.",
  });
};
