import type {Response} from "express";
import type { ApiResponse, PaginationMeta } from "../types/api-response.ts";

export const sendSuccessResponse = <T>(res:Response, data:T , statusCode = 200 , message?:string ,  meta?:PaginationMeta)=> {
    const response : ApiResponse<T> = {
        success:true,
        data,
        ...(message !== undefined && {message}),
        ...(meta !== undefined && {meta})
    }

    res.status(statusCode).json(response);
}