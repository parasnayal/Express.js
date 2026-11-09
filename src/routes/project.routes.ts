import { Router } from "express";
import { createProjectWithTaskController } from
  "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.post(
  "/with-initial-task",
  createProjectWithTaskController
);

export default projectRouter;