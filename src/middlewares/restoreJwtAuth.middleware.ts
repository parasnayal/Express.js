import type {Request,Response,NextFunction} from "express";
import { AppError } from "../utils/AppError.ts";
import { verifyAccessToken } from "../utils/jwt.ts";
import { pool } from "../config/database.ts";
import type { AuthenticatedUser } from "../types/auth.types.ts";

export const restoreJwtAuth = async (req:Request,res:Response,next:NextFunction) => {
    const authorization = req.headers.authorization;

    if(!authorization){
        next();
        return;
    }
    const match = /^Bearer (\S+)$/i.exec(
      authorization
    );

      if (!match) {
      throw new AppError(
        401,
        "INVALID_TOKEN",
        "Invalid authentication token"
      );
    }

    let userId:number;

    try {
        userId = await verifyAccessToken(match[1]!);

    } catch (error) {
        throw new AppError(
        401,
        "INVALID_TOKEN",
        "Invalid or expired access token"
      );
    }

    const result = await pool.query<AuthenticatedUser>(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [userId]
    );

     const user = result.rows[0];

     if (!user) {
      throw new AppError(
        401,
        "INVALID_TOKEN",
        "Invalid authentication token"
      );
    }
     
    req.auth = user;

    next();
}