// import express , { type Express , type Request , type Response} from "express";

import app from "./app.ts";
import { pool } from "./config/database.ts";

// type Task = {
//   id: number;
//   title: string;
//   completed: boolean;
// };

// const tasks: Task[] = [];

// let nextTaskId = 1;

// const app : Express = express();

// app.use(express.json());

const PORT = 3000;

// app.get("/tasks",(req:Request , res:Response)=>{
//     res.status(200).json({
//         status:"OK",
//         message:"Express server is running successfully."
//     })
// });

// app.get("/health",(req:Request,res:Response)=>{
//     res.status(200).json({
//         status:"OK",
//         message:"Server is healthy and running."
//     })
// });

// app.post("/tasks",(req:Request,res:Response)=>{
//     console.log(req.body);
//     const {title} = req.body || {};

//     if(typeof title !== "string" || !title.trim()){
//         res.status(400).json({
//             status:"ERROR",
//             message:"Valid title is required"
//         })
//     }

//     const newTask: Task = {
//     id: nextTaskId++,
//     title: title.trim(),
//     completed: false,
//     };

//     tasks.push(newTask);

//     res.status(201).json({
//         status:"OK",
//         message:"Data received successfully.",
//         data:newTask
//     })
// });

const server = app.listen(PORT ,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})

let shuttingDown = false;

const shutDown = async (signal:string) => {
      if(shuttingDown) return;

      shuttingDown = true;

      console.log(`Received ${signal}`);


      try {
          await new Promise<void>((resolve,reject)=>{
                server.close((error) => {
                if (error) reject(error);
                else resolve();
            });
          })
          await pool.end();

          process.exitCode = 0;
      } catch (error) {
        console.error("Shutdown failed:", error);
        process.exitCode = 1;
      }
}

process.once("SIGINT", () => {
  void shutDown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutDown("SIGTERM");
});