import { AppError } from "./AppError.ts";

export function parseTaskId(rawId: string): number {
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