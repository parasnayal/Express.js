import type { RequestHandler } from "express";
import { projectService } from
  "../services/project.service.ts";

export const createProjectWithTaskController:
  RequestHandler = async (req, res) => {
    const { name, taskTitle } = req.body ?? {};

    const result =
      await projectService.createProjectWithTask(
        name,
        taskTitle
      );

    res.status(201).json({
      success: true,
      data: result,
      message: "Project and task created successfully",
    });
  };