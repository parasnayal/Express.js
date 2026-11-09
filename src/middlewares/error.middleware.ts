import { type Request , type Response , type ErrorRequestHandler, type NextFunction } from "express";

import { AppError } from "../utils/AppError.ts";
import { translateDatabaseError } from "../utils/translate-database-error.ts";
import { DatabaseError } from "pg";

// export const errorHandler : ErrorRequestHandler = (err : Error , req : Request , res : Response , next : NextFunction) => {
// console.error('API Error:',err);

// if(res.headersSent){
//     return next(err);
// }

// res.status(500).json({
//     status:"ERROR",
//     message:"Internal server error."
// })
// }
export const errorHandler : ErrorRequestHandler = (error : Error , req : Request , res : Response , next : NextFunction) => {
console.error('API Error:',error);

   if(res.headersSent){
    return next(error);
    }

    if(error instanceof AppError){
        const validStatusCode = Number.isInteger(error.statusCode) 
        && error.statusCode >= 400 && error.statusCode <= 599;

        if(validStatusCode){
            res.status(error.statusCode).json({
                success: false,
                error:{
                    code : error.code,
                    message : error.message,
                    ...(error.details !== undefined && {
                        details : error.details
                    })
                },
                ...(res.locals.requestId && {
                    requestId : res.locals.requestId,
                })
            });

            return;
        }

        if (
        error !== null &&
        typeof error === "object" &&
        "type" in error &&
        error.type === "entity.parse.failed"
        ){
       res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Malformed JSON request body",
      },
    });
    return;
        }
    }

    if (error instanceof DatabaseError) {
    const appError = translateDatabaseError(error);

    if (appError) {
      res.status(appError.statusCode).json({
        success: false,
        error: {
          code: appError.code,
          message: appError.message,
        },
      });
      return;
    }
  }

  console.error("Unexpected error:", error);

   res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
    ...(res.locals.requestId && {
      requestId: res.locals.requestId,
    }),
  });
}