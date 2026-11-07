import { pool } from "../config/database.ts";
import { TASK_LIST } from "../constant.ts";

import type { NewTask, Task } from "../models/task.model.ts";

let nextId = 4;

// export const taskRepository = {
//     async findAll() : Promise<Task[]> {
//         return TASK_LIST.map((task)=>({...task}))
//     },

//     async findById(id:number) : Promise<Task | null>{
//     const task = TASK_LIST.find((item) => item.id === id);

//     return task ? { ...task } : null;
//     },

//     async create(data: NewTask): Promise<Task> {
//     const task: Task = {
//       id: nextId++,
//       ...data,
//     };

//     TASK_LIST.push(task);

//     return { ...task };
//   },
// }

export const taskRepository = {
    async findAll() : Promise<Task[]> {
        const result = await pool.query(
            "SELECT id, title, completed FROM tasks ORDER BY id"
        )

        return result.rows;
    },

    async findById(id:number) : Promise<Task | null>{
    const task = TASK_LIST.find((item) => item.id === id);

    return task ? { ...task } : null;
    },

    async create(data: NewTask): Promise<Task> {
    const task: Task = {
      id: nextId++,
      ...data,
    };

    TASK_LIST.push(task);

    return { ...task };
  },
}