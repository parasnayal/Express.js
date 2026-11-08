import { pool } from "../config/database.ts";
// import { TASK_LIST } from "../constant.ts";

import type { Task , CreateTaskInput , UpdateTaskInput , ReplaceTaskInput } from "../models/task.model.ts";


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

type SortField = "id" | "title";
type SortOrder = "asc" | "desc";

const sortColumns:Record<SortField,string> = {
    id:"id",
    title:"title"
}

export const taskRepository = {
    async findAll() : Promise<Task[]> {
        const result = await pool.query(
            "SELECT id, title, completed FROM tasks ORDER BY id"
        )

        return result.rows;
    },

    async findTask(options:{
    completed?: boolean;
    sortBy: SortField;
    order: SortOrder;
    limit: number;
    // offset: number;
    }){
        const column = sortColumns[options.sortBy];

        const direction = options.order === 'desc' ? 'DESC' : 'ASC';

        const result = await pool.query<Task>(
            `SELECT id , title , completed FROM tasks WHERE ($1::boolean IS NULL OR completed = $1) 
            ORDER BY ${column} ${direction},id ASC LIMIT $2`,
            [
            options?.completed ?? null,
            options.limit,
            ]
        )

        return result.rows;

    },

    async findById(id:number) : Promise<Task | null>{
    const result = await pool.query<Task>(
        `SELECT * FROM tasks WHERE id = $1`,
        [id]
    )

    return result.rows[0] ? result.rows[0] : null;
    },

    async create(data: CreateTaskInput): Promise<Task> {
    const {title}  = data;

    const result = await pool.query<Task>(
        `INSERT INTO tasks(title) VALUES($1) RETURNING id , title , completed`,
        [title]
    )

    const task = result.rows[0];

    if (!task) {
    throw new Error("Task creation returned no row");
    }

    return task;
    },

    async replace(id :number ,data:ReplaceTaskInput):Promise<Task | null>{
        const {title , completed} = data;

        const result = await pool.query<Task>(
            `UPDATE tasks SET title=$1, completed=$2 WHERE id = $3 RETURNING id , title , completed`,
            [title , completed , id]
        )


        return result.rows[0] ?? null;
    },
    async update(id :number ,data:UpdateTaskInput):Promise<Task | null>{
        const {title , completed} = data;

        const result = await pool.query<Task>(
            `UPDATE tasks SET title=COALESCE($1,title), completed=COALESCE($2,completed) 
            WHERE id = $3 RETURNING id , title , completed`,
            [title , completed , id]
        )


        return result.rows[0] ?? null;
    },

    async delete(id:number){
       const result = await pool.query<Task>(
        `DELETE FROM tasks WHERE id=$1`,[id]
        );

        console.log("Deleting")

        return (result.rowCount ?? 0) > 0;
    }
}