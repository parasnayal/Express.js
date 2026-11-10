import { pool } from "../config/database.ts";
// import { TASK_LIST } from "../constant.ts";

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ReplaceTaskInput,
} from "../models/task.model.ts";
import type { AuthenticatedUser } from "../types/auth.types.ts";

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

const sortColumns: Record<SortField, string> = {
  id: "id",
  title: "title",
};

export const taskRepository = {
  async findAll(currentUser: AuthenticatedUser): Promise<Task[]> {
    const result = await pool.query(`SELECT id, title, completed FROM tasks 
        WHERE ($1::boolean OR user_id = $2) ORDER BY id`,
        [currentUser.role === "ADMIN",currentUser.id]);

    return result.rows;
  },

  async findTask(options: {
    completed?: boolean;
    sortBy: SortField;
    order: SortOrder;
    limit: number;
    // offset: number;
  }) {
    const column = sortColumns[options.sortBy];

    const direction = options.order === "desc" ? "DESC" : "ASC";

    const result = await pool.query<Task>(
      `SELECT id , title , completed FROM tasks WHERE ($1::boolean IS NULL OR completed = $1) 
            ORDER BY ${column} ${direction},id ASC LIMIT $2`,
      [options?.completed ?? null, options.limit],
    );

    return result.rows;
  },

  async findById(id: number): Promise<Task | null> {
    const result = await pool.query<Task>(`SELECT * FROM tasks WHERE id = $1`, [id]);

    return result.rows[0] ? result.rows[0] : null;
  },

  async create(data: CreateTaskInput,userId:number): Promise<Task> {
    const { title } = data;

    const result = await pool.query<Task>(
      `INSERT INTO tasks(title,user_id) VALUES($1,$2) RETURNING id , title , completed`,
      [title,userId],
    );

    const task = result.rows[0];

    if (!task) {
      throw new Error("Task creation returned no row");
    }

    return task;
  },
  async replace(id: number, data: ReplaceTaskInput , currentUser: AuthenticatedUser): Promise<Task | null> {
    const { title, completed } = data;

    const result = await pool.query<Task>(
      `UPDATE tasks SET title=$1, completed=$2 WHERE id = $3 AND ($4::boolean OR user_id=$5) RETURNING id , title , completed`,
      [title, completed, id,currentUser.role === "ADMIN", currentUser.id],
    );

    return result.rows[0] ?? null;
  },
  async update(
    id: number,
    data: UpdateTaskInput,
    currentUser: AuthenticatedUser,
  ): Promise<Task | null> {
    const { title, completed } = data;

    const result = await pool.query<Task>(
      `UPDATE tasks SET title=COALESCE($1,title), completed=COALESCE($2,completed) 
            WHERE id = $3 AND ($4::boolean OR user_id=$5) RETURNING id , title , completed`,
      [title, completed, id, currentUser.role === "ADMIN", currentUser.id],
    );

    return result.rows[0] ?? null;
  },
  async delete(id: number) {
    const result = await pool.query<Task>(`DELETE FROM tasks WHERE id=$1`, [id]);

    console.log("Deleting");

    return (result.rowCount ?? 0) > 0;
  },
  async findOwnedTask(taskId: number, userId: number): Promise<Task | null> {
    const result = await pool.query<Task>(
      `SELECT id, title, completed, user_id
        FROM tasks
        WHERE id = $1 AND user_id = $2`,
      [taskId, userId],
    );

    return result.rows[0] ?? null;
  },
  async deleteForUser(taskId: number, currentUser: AuthenticatedUser): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM tasks
     WHERE id = $1
       AND ($2::boolean OR user_id = $3)`,
      [taskId, currentUser.role === "ADMIN", currentUser.id],
    );

    return (result.rowCount ?? 0) > 0;
  },
};
