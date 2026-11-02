import express from "express";

import taskRouter from "./routes/task.routes.ts"

const app = express();

app.use(express.json());

app.use("/tasks",taskRouter);

export default app;