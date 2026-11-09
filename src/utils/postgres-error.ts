import { DatabaseError } from "pg";

export const isPostgresError = (
  error: unknown
): error is DatabaseError => {
  return error instanceof DatabaseError;
}