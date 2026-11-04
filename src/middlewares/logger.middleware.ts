import type { NextFunction , Request , Response } from "express";

// export const requestLogger = (req : Request,res : Response,next : NextFunction) => {
//     console.log(`${req.method} ${req.originalUrl}`);
    
//     const start = performance.now();

//     res.once("finish",()=>{
//         const duration = performance.now() - start;

//         console.log({
//             method:req.method,
//             path : req.path,
//             statusCode:res.statusCode,
//             durationMs:Math.round(duration)
//         })
//     })

//     next();

// }

export const requestLogger = (req : Request,res : Response,next : NextFunction) => {
    const start = performance.now();
    
    let logged = false;

    const logRequest = (outcome: string) =>{
        if(logged) return ;

        logged = true;

    console.log({
      requestId: res.locals.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      outcome,
      durationMs: Math.round(
        performance.now() - start
      ),
    });
    }

    res.once("finish",()=>{
        const duration = performance.now() - start;

        logRequest("Completed");
    })

    res.once("close",()=>{
        if(!res.writableFinished){
            logRequest("Aborted");
        }
    })

    next();

}