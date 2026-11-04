import express from "express";

import taskRouter from "./routes/task.routes.ts";

// import {logger } from "./middlewares/task.middleware.ts";
import {errorHandler } from "./middlewares/error.middleware.ts";
import {requestLogger} from "./middlewares/logger.middleware.ts";
import {requestIdMiddleware} from "./middlewares/request-id.middleware.ts";

const app = express();

// app.use(logger);

app.use(requestIdMiddleware)

app.use(requestLogger);

app.use(express.json());

app.use("/tasks",taskRouter);

app.use(errorHandler);

export default app;