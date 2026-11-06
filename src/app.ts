import express from "express";

import taskRouter from "./routes/task.routes.ts";

// import {logger } from "./middlewares/task.middleware.ts";
import {errorHandler } from "./middlewares/error.middleware.ts";
import {requestLogger} from "./middlewares/logger.middleware.ts";
import {requestIdMiddleware} from "./middlewares/request-id.middleware.ts";
import { AppError } from "./utils/AppError.ts";

const app = express();

// app.use(logger);

app.use(requestIdMiddleware)

app.use(requestLogger);

app.use(express.json());

app.use("/tasks",taskRouter);

app.use(()=>{
     throw new AppError(
    404,
    "ROUTE_NOT_FOUND",
    "Route not found"
  );
})

app.use(errorHandler);

export default app;