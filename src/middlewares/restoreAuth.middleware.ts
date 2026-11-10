import type { NextFunction, RequestHandler, Request, Response } from "express";
import { pool } from "../config/database.ts";
import type { AuthenticatedUser } from "../types/auth.types.ts";

export const restoreAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;

  console.log(userId,'userIddddd')

  if (!userId) {
    next();

    return;
  }

  const result = await pool.query<AuthenticatedUser>(
    `SELECT id, role
       FROM users
       WHERE id = $1`,
    [userId],
  );

  const user = result.rows[0];

  if (!user) {
    next();
    return;
  }

  req.auth = user;

  next();
};
