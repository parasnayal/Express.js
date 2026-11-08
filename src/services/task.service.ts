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

    async updateTask(id:number,title:string,completed:boolean){
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
    else if(typeof completed !== "boolean"){
        throw new AppError(
        400,
        "VALIDATION_ERROR",
        "completed should be boolean"
      );
    }
    else if(typeof id !==  "number"){
         throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Task id should be a number"
      );
    }

    return taskRepository.replace({id,title,completed})

    },

    async deleteTask(id:number){
        const task = await taskRepository.delete(id);

        if (!task) {
        throw new AppError(
        404,
        "TASK_NOT_FOUND",
        "Task not found"
        );
        
    }

    return task;
    },
    
}