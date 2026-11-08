import type {Response , Request, RequestHandler} from "express";

import { taskService } from "../services/task.service.ts"
import { AppError } from "../utils/AppError.ts";

function parseTaskId(rawId: string): number {
  if (!/^[1-9]\d*$/.test(rawId)) {
    throw new AppError(
      400,
      "INVALID_TASK_ID",
      "Task ID must be a positive integer"
    );
  }

  const id = Number(rawId);

  if (!Number.isSafeInteger(id)) {
    throw new AppError(
      400,
      "INVALID_TASK_ID",
      "Task ID is out of range"
    );
  }

  return id;
}

export const getAllTaskController = async (req : Request,res:Response) => {
      const tasks = await taskService.getAllTasks();

      res.status(200).json({
        success: true,
        data: tasks,
      })
}

export const getTaskByIdController: RequestHandler<{ id: string }> = async (req :Request, res : Response) => {
  const id = parseTaskId(req.params.id as string);

  const task = await taskService.getTaskById(id);

  res.status(200).json({
    success: true,
    data: task,
  });
};

export const createTaskController: RequestHandler = async (req, res) => {
    const task = await taskService.createTask(
      req.body?.title
    );

    res
      .status(201)
      .location(`/api/v1/tasks/${task?.id}`)
      .json({
        success: true,
        data: task,
        message: "Task created successfully",
      });
};

export const updateTaskController : RequestHandler<{id:string}> = async (req:Request,res:Response) => {
    const id = parseTaskId(req.params.id as string);

    // const {title , completed} = req.body || {};
    
    const task = await taskService.updateTask(id, req.body);

    res.status(200).json({
        success:true,
        data:task,
        message:"Task updated successfully."
    })
}
export const replaceTaskController : RequestHandler<{id:string}> = async (req:Request,res:Response) => {
    const id = parseTaskId(req.params.id as string);

    // const {title , completed} = req.body || {};
    
    const task = await taskService.replaceTask(id, req.body);

    res.status(200).json({
        success:true,
        data:task,
        message:"Task updated successfully."
    })
}

export const deleteTaskController: RequestHandler<{ id: string }> = async (req :Request, res : Response) => {
  const id = parseTaskId(req.params.id as string);

  await taskService.deleteTask(id);

  res.status(204).end()
};