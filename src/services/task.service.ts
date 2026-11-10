import type { ReplaceTaskInput, Task, UpdateTaskInput } from "../models/task.model.ts";
import { taskRepository } from "../repositories/task.repository.ts";
import type { AuthenticatedUser } from "../types/auth.types.ts";
import { AppError } from "../utils/AppError.ts";

export const taskService = {
  async getAllTasks(currentUser: AuthenticatedUser) {
    return taskRepository.findAll(currentUser);
  },
  async getTaskById(id: number) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    return task;
  },

  async createTask(title: unknown,currentUser: AuthenticatedUser) {
    if (typeof title !== "string" || !title.trim()) {
      throw new AppError(400, "VALIDATION_ERROR", "Valid task title is required");
    }

    return taskRepository.create({
      title: title.trim(),
    },currentUser.id);
  },

  async updateTask(id: number, data: UpdateTaskInput,currentUser: AuthenticatedUser) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new AppError(400, "VALIDATION_ERROR", "A valid update object is required");
    }

    const keys = Object.keys(data);

    if (keys.length === 0 || keys.some((key) => !["title", "completed"].includes(key))) {
      throw new AppError(400, "VALIDATION_ERROR", "At least one supported field is required");
    }

    const { title, completed } = data;

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      throw new AppError(400, "VALIDATION_ERROR", "Valid task title is required");
    }
    if (completed !== undefined && typeof completed !== "boolean") {
      throw new AppError(400, "VALIDATION_ERROR", "completed should be boolean");
    }

    const task = await taskRepository.update(id, {
      ...(title !== undefined && {
        title: title.trim(),
      }),
      ...(completed !== undefined && {
        completed,
      }),
      
    },currentUser);

    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    return task;
  },
  async replaceTask(id: number, data: ReplaceTaskInput,currentUser: AuthenticatedUser) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new AppError(400, "VALIDATION_ERROR", "A valid task object is required");
    }
    const { title, completed } = data;

    if (typeof title !== "string" || !title.trim() || typeof completed !== "boolean") {
      throw new AppError(400, "VALIDATION_ERROR", "Valid title and completed fields are required");
    }

    const task = await taskRepository.replace(id, { title: title.trim(), completed },currentUser);

    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    return task;
  },

  async deleteTask(id: number) {
    const task = await taskRepository.delete(id);

    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    return task;
  },
  async getTaskForUser(taskId: number, currentUser: AuthenticatedUser): Promise<Task> {
    const task =
      currentUser.role === "ADMIN"
        ? await taskRepository.findById(taskId)
        : await taskRepository.findOwnedTask(taskId, currentUser.id);

    if (!task) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }

    return task;
  },
  async deleteTaskForUser(taskId: number, currentUser: AuthenticatedUser): Promise<void> {
    const deleted = await taskRepository.deleteForUser(taskId, currentUser);

    if (!deleted) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
  },
};
