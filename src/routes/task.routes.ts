import {Router, type Request, type Response} from "express";

const taskRouter  = Router();

interface TaskType {
    id: number;
    title: string;
    completed: boolean;
}

const TASK_LIST : TaskType[] = [
  { id: 1, title: "Learn Node.js", completed: true },
  { id: 2, title: "Learn Express", completed: false },
  { id: 3, title: "Learn TypeScript", completed: true },
];

export const getTasks = async () => {
  throw new Error("Database connection failed");
};

const getTaskId =  (tasks:TaskType[]) => {
    let nextTaskId = Math.max(0, ...tasks.map(task => task.id)) + 1;

    return nextTaskId;
}

taskRouter.get("/health",(req:Request,res:Response)=>{
    
    res.status(200).json({
        status:"OK",
        data:TASK_LIST,
    })
})

taskRouter.get("/",(req : Request , res:Response)=>{
    const {completed} = req.query || {};

    console.log('Running');

    if(!completed){
    res.status(200).json({
        status:"OK",
        data:TASK_LIST,
        message:"All tasks fetched successfully.",
    });

    return;
    }

    if (
  completed !== undefined &&
  completed !== "true" &&
  completed !== "false"
) {
  res.status(400).json({
    status: "ERROR",
    message: "completed must be true or false.",
  });
  return;
}

   const filteredTasks = TASK_LIST.filter((task)=> task.completed === (completed === "true"));
    
   res.status(200).json({
    status:"OK",
    data:filteredTasks,
    message:`All tasks with completed status ${completed} fetched successfully.`,
   })
})

taskRouter.get("/:id",(req : Request,res:Response)=>{
    const {id} = req.params || {};

    const getTaskById = TASK_LIST.find((task)=>task.id === Number(id));

    if(!getTaskById){
        res.status(404).json({
            status:"ERROR",
            message:`Task with id ${id} not found.`
        })

        return;
    }

    res.status(200).json({
    status:"OK",
    taskId:getTaskById
    });
});

taskRouter.post("/",(req:Request,res:Response)=>{
    console.log(req.body , 'req.body');

    if(!req.body || !req.body.title || typeof req.body.title !== "string" || !req.body.title.trim()){
        res.status(400).json({
            status:"ERROR",
            message:"Valid title is required."
        });

        return ;
    }

    const {title } = req.body || {};

    const newTask = {
        id:getTaskId(TASK_LIST),
        title:title.trim(),
        completed:false
    }

    TASK_LIST.push(newTask);

    res.status(201).json({
        status:"OK",
        message:"Task created successfully.",
    })
})

taskRouter.delete("/:id",(req:Request,res:Response)=>{
 const {id} = req.params || {};

  if(!id){
    res.status(400).json({
        status:"ERROR",
        message:"Task id is required."
    })

    return;

}

    const findTaskIndex = TASK_LIST.findIndex((task)=>task.id === Number(id));

    if(findTaskIndex === -1){
        res.status(404).json({
            status:"ERROR",
            message:`Task with id ${id} not found.`
        })

        return ;
    }

    TASK_LIST.splice(findTaskIndex,1);

    res.status(200).json({
        status:"OK",
        message:`Task with id ${id} deleted successfully.`
    })
  
})


export default taskRouter;