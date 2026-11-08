import {Router} from "express";
import { createTaskController, deleteTaskController, getAllTaskController, getTaskByIdController, updateTaskController } from "../controllers/task.contoller.ts";
// import { sendSuccessResponse } from "../utils/api-response.ts";
// import { AppError } from "../utils/AppError.ts";
// import { TASK_LIST } from "../constant.ts";

const taskRouter  = Router();

// interface TaskType {
//     id: number;
//     title: string;
//     completed: boolean;
// }

// export const getTasks = async () => {
//   throw new Error("Database connection failed");
// };

// const getTaskId =  (tasks:TaskType[]) => {
//     let nextTaskId = Math.max(0, ...tasks.map(task => task.id)) + 1;

//     return nextTaskId;
// }

// const validateTaskId = (
//   rawId: string
// ): number | null => {
//   if (!/^[1-9]\d*$/.test(rawId)) {
//     return null;
//   }

//   const id = Number(rawId);

//   return Number.isSafeInteger(id) ? id : null;
// };

// taskRouter.get("/health",(req:Request,res:Response)=>{
    
//     res.status(200).json({
//         status:"OK",
//         data:TASK_LIST,
//     })
// })

// taskRouter.get("/",(req : Request , res:Response)=>{
//     const {completed} = req.query || {};

//     console.log('Running');

//     if(!completed){
//     // res.status(200).json({
//     //     status:"OK",
//     //     data:TASK_LIST,
//     //     message:"All tasks fetched successfully.",
//     // });

//     sendSuccessResponse(
//         res,
//         TASK_LIST,
//         200,
//         'Task fetched successfully'
//     )

//     return;
//     }

//     if (completed !== undefined && completed !== "true" && completed !== "false") {
//     throw new AppError(
//     400,
//     "TASK_NOT_FOUND",
//     "Task status must be true or false."
//     )
//     //   res.status(400).json({
//     //     status: "ERROR",
//     //     message: "completed must be true or false.",
//     //   });
//     //   return;
//     }

//    const filteredTasks = TASK_LIST.filter((task)=> task.completed === (completed === "true"));
    
//    res.status(200).json({
//     status:"OK",
//     data:filteredTasks,
//     message:`All tasks with completed status ${completed} fetched successfully.`,
//    })
// })

// taskRouter.get("/:id",(req : Request,res:Response)=>{
//     const {id} = req.params || {};

//     const getTaskById = TASK_LIST.find((task)=>task.id === Number(id));

//     if(!getTaskById){
//         res.status(404).json({
//             status:"ERROR",
//             message:`Task with id ${id} not found.`
//         })

//         return;
//     }

//     res.status(200).json({
//     status:"OK",
//     taskId:getTaskById
//     });
// });

// taskRouter.post("/",(req:Request,res:Response)=>{
//     console.log(req.body , 'req.body');

//     if(!req.body || !req.body.title || typeof req.body.title !== "string" || !req.body.title.trim()){
//         res.status(400).json({
//             status:"ERROR",
//             message:"Valid title is required."
//         });

//         return ;
//     }

//     const {title } = req.body || {};

//     const newTask = {
//         id:getTaskId(TASK_LIST),
//         title:title.trim(),
//         completed:false
//     }

//     TASK_LIST.push(newTask);

//     res.status(201).json({
//         status:"OK",
//         message:"Task created successfully.",
//     })
// })

// taskRouter.delete("/:id",(req:Request,res:Response)=>{
//  const {id} = req.params || {};

//   if(!id){
//     res.status(400).json({
//         status:"ERROR",
//         message:"Task id is required."
//     })

//     return;

// }

//     const findTaskIndex = TASK_LIST.findIndex((task)=>task.id === Number(id));

//     if(findTaskIndex === -1){
//         res.status(404).json({
//             status:"ERROR",
//             message:`Task with id ${id} not found.`
//         })

//         return ;
//     }

//     TASK_LIST.splice(findTaskIndex,1);

//     res.status(200).json({
//         status:"OK",
//         message:`Task with id ${id} deleted successfully.`
//     })
  
// });

// taskRouter.put("/:id",(req:Request,res:Response)=>{
//     const {id} = req.params || {};

//     if(!validateTaskId(id as string)){
//         res.status(400).json({
//             status:"ERROR",
//             message:"Task id is required."
//         });

//         return;
//     }

//     const {title , completed} = req.body || {};

//     if (
//     typeof title !== "string" ||
//     !title.trim() ||
//    typeof completed !== "boolean"
//    ) {
//     res.status(400).json({
//     status: "ERROR",
//     message: "Valid title and completed fields are required.",
//     });

//     return;
//     }

//     const findTaskIndex = TASK_LIST.findIndex((task)=>task.id === Number(id));

//     if(findTaskIndex === -1){
//         res.status(404).json({
//             status:"ERROR",
//             message:`Task with id ${id} not found.`
//         });

//         return ;
//     }

//     const updatedTask = {
//         id:Number(id),
//         title:title?.trim(),
//         completed
//     };

//     TASK_LIST[findTaskIndex] = updatedTask;

//     res.status(200).json({
//         status:"OK",
//         message:`Task with id ${id} updated successfully.`,
//         data:updatedTask
//     });

    
// });


// taskRouter.patch("/:id",(req:Request,res:Response)=>{
//     const {id} = req.params || {};

//     if(!validateTaskId(id as string)){
//         res.status(400).json({
//             status:"ERROR",
//             message:"Task id is required."
//         });

//         return;
//     }

//     const body = req.body;

//     if (
//   !body ||
//   typeof body !== "object" ||
//   Array.isArray(body)
// ) {
//   res.status(400).json({
//     status: "ERROR",
//     message: "A valid JSON object is required.",
//   });
//   return;
// }

//     const {title , completed} = req.body || {};

//     if (
//   Object.keys(body).length === 0 ||
//   Object.keys(body).some(
//     (key) => !["title", "completed"].includes(key)
//   ) ||
//   (
//     title !== undefined &&
//     (
//       typeof title !== "string" ||
//       !title.trim()
//     )
//   ) ||
//   (
//     completed !== undefined &&
//     typeof completed !== "boolean"
//   )
// ) {
//   res.status(400).json({
//     status: "ERROR",
//     message: "Invalid task update.",
//   });

//   return;
// }

//     const findTaskIndex = TASK_LIST.findIndex((task)=>task.id === Number(id));

//     if(findTaskIndex === -1){
//         res.status(404).json({
//             status:"ERROR",
//             message:`Task with id ${id} not found.`
//         });

//         return ;
//     }

//     const updatedTask = {
//         ...TASK_LIST[findTaskIndex],
//         title:title !== undefined ? title.trim() : TASK_LIST[findTaskIndex].title,
//         completed:completed !== undefined ? completed : TASK_LIST[findTaskIndex].completed
//     };

//     TASK_LIST[findTaskIndex] = updatedTask;

//     res.status(200).json({
//         status:"OK",
//         message:`Task with id ${id} updated successfully.`,
//         data:updatedTask
//     });


// })

taskRouter.get("/",getAllTaskController);
taskRouter.get("/:id",getTaskByIdController);
taskRouter.post("/",createTaskController);
taskRouter.put("/:id",updateTaskController);
taskRouter.delete("/:id",deleteTaskController);


export default taskRouter;