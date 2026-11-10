import type { RequestHandler } from "express";
import type { Role } from "../types/auth.types.js";
import { AppError } from "../utils/AppError.js";

export const requireRole = (...allowedRoles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.auth) {
      throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    }

    if (!allowedRoles.includes(req.auth.role)) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission");
    }

    next();
  };
};
