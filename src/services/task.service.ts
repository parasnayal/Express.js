import { taskRepository } from "../repositories/task.repository.ts"
import { AppError } from "../utils/AppError.ts";

export const taskService = {
    async getAllTasks(){
        return taskRepository.findAll();
    },

    async getTaskById(id:number){
        const task = await taskRepository.findById(id);

        if (!task) {
        throw new AppError(
        404,
        "TASK_NOT_FOUND",
        "Task not found"
        );
        
    }

    return task;
    },

    async createTask(title: unknown) {
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Valid task title is required"
      );
    }

    return taskRepository.create({
      title: title.trim(),
      completed: false,
    });
  },
}