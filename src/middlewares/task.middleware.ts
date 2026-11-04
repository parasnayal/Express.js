import {type Request , type Response , type NextFunction} from "express";

// export const logger = (req:Request , res : Response ,next : NextFunction) => {
// console.log(req.method , 'method');
// console.log(req.url , 'url');

// next();
// }

export const errorHandler = (err : Error , req : Request , res : Response , next : NextFunction) => {
console.error(err.stack);

if(res.headersSent){
    return next(err);
}

res.status(500).json({
    status:"ERROR",
    message:"Internal server error."
})

}