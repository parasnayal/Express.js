import { pool } from "../config/database.ts";
import { projectRepository } from "../repositories/project.repository.ts";
import { AppError } from "../utils/AppError.ts";

export const projectService = {
    async createProjectWithTask(name:unknown,taskTitle:unknown){
        if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof taskTitle !== "string" ||
        !taskTitle.trim()
    ) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Valid project name and task title are required"
      );
    }

    const client = await pool.connect();

    let discardClient = false;

    try {
        await client.query("BEGIN");

        const project = await projectRepository.create(
            client,
            name.trim()
        )

        const task = await projectRepository.createTask(
            client,
            project.id,
            taskTitle.trim()
        )

        await client.query("COMMIT");

        return {project,task}
    } catch (error) {
        try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        discardClient = true;
        console.error("Rollback failed:", rollbackError);
      }
      throw error;
    }finally{
        client.release(discardClient)
    }
    }
}