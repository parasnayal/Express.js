import type { DatabaseError } from "pg";
import { AppError } from "./AppError.js";

export const translateDatabaseError = (
  error: DatabaseError
): AppError | null => {
  if (
    error.code === "23505" &&
    error.constraint === "users_email_key"
  ) {
    return new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "This email is already registered"
    );
  }

  if (
    error.code === "23503" &&
    error.constraint === "tasks_user_id_fkey"
  ) {
    return new AppError(
      400,
      "INVALID_USER_REFERENCE",
      "The selected user does not exist"
    );
  }

  return null;
}