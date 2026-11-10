import type { Response, Request, RequestHandler } from "express";

import { taskService } from "../services/task.service.ts";
import { parseTaskId } from "../utils/paraseTaskId.ts";
import { AppError } from "../utils/AppError.ts";

export const getAllTaskController = async (req: Request, res: Response) => {
  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const tasks = await taskService.getAllTasks(req.auth);

  res.status(200).json({
    success: true,
    data: tasks,
  });
};

export const getTaskByIdController: RequestHandler<{ id: string }> = async (
  req: Request,
  res: Response,
) => {
  const id = parseTaskId(req.params.id as string);

  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const task = await taskService.getTaskForUser(
  id,
  req.auth
);;

  res.status(200).json({
    success: true,
    data: task,
  });
};

export const createTaskController: RequestHandler = async (req, res) => {
  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const task = await taskService.createTask(req.body?.title, req.auth);

  res.status(201).location(`/api/v1/tasks/${task?.id}`).json({
    success: true,
    data: task,
    message: "Task created successfully",
  });
};

export const updateTaskController: RequestHandler<{ id: string }> = async (
  req: Request,
  res: Response,
) => {
  const id = parseTaskId(req.params.id as string);

  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  const task = await taskService.updateTask(id, req.body, req.auth);

  res.status(200).json({
    success: true,
    data: task,
    message: "Task updated successfully.",
  });
};

export const replaceTaskController: RequestHandler<{ id: string }> = async (
  req: Request,
  res: Response,
) => {
  const id = parseTaskId(req.params.id as string);

  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  // const {title , completed} = req.body || {};

  const task = await taskService.replaceTask(id, req.body, req.auth);

  res.status(200).json({
    success: true,
    data: task,
    message: "Task updated successfully.",
  });
};

// export const deleteTaskController: RequestHandler<{ id: string }> = async (req :Request, res : Response) => {
//   const id = parseTaskId(req.params.id as string);

//   await taskService.deleteTask(id);

//   res.status(204).end()
// };

export const deleteTaskController: RequestHandler<{ id: string }> = async (req, res) => {
  const taskId = parseTaskId(req.params.id);

  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  await taskService.deleteTaskForUser(taskId, req.auth);

  res.status(204).end();
};
