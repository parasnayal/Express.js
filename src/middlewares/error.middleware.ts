import { type Request , type Response , type ErrorRequestHandler, type NextFunction } from "express";

export const errorHandler : ErrorRequestHandler = (err : Error , req : Request , res : Response , next : NextFunction) => {
console.error('API Error:',err);

if(res.headersSent){
    return next(err);
}

res.status(500).json({
    status:"ERROR",
    message:"Internal server error."
})
}