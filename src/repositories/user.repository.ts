import { pool } from "../config/database.ts"
import type { User, UserTask } from "../models/user.model.ts";

export const userRepository = {
    async findAll():Promise<User[]>{
        const result = await pool.query(
        'SELECT * FROM users'
        );

        return result.rows;
    },
    async findById(userId:number):Promise<User| null>{
        const result = await pool.query(
            `SELECT id, name ,email FROM users WHERE id = $1`,
            [userId]
        );

        return result.rows[0] ?? null;
    },
    async findTasksByUserId(userId:number):Promise<UserTask[]>{
        const result = await pool.query(
        `SELECT t.id , t.title , t.completed  FROM users AS u 
        INNER JOIN tasks AS t ON t.user_id = u.id WHERE u.id =$1`,
        [userId]
        );

        return result.rows;
    },
    async findUsersWithTaskCount(id:number){
        const result = await pool.query(
            `SELECT u.id , u.name , COUNT(t.id)::int AS "totalTasks" FROM users AS u LEFT JOIN tasks AS t 
            ON t.user_id = u.id WHERE u.id = $1 GROUP BY u.id ,u.name ORDER BY id ASC`,
            [id]
        )

        return result.rows[0];
    },
    async create(data:{name:string,email:string}){
        const {name,email} = data || {};

        const result = await pool.query(
            `INSERT INTO users(name,email)
            VALUES($1,$2) RETURNING id,name,email`,
            [name,email]
        )

        console.log(result,'resssssssss')

       return result.rows[0];
    }
}