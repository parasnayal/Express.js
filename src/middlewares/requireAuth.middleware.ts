import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  next();
};
