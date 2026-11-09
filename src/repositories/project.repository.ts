import type {PoolClient} from "pg";
import type { Project } from "../models/project.model.ts";

export const projectRepository = {
      async create(client:PoolClient , name:string):Promise<Project>{
        const result = await client.query(
            `INSERT INTO projects (name)
             VALUES ($1)
             RETURNING id, name`,
             [name]
        )

        return result.rows[0];
      },
      async createTask(client:PoolClient,projectId:number,title:string){
        const result = await client.query(
            `INSERT INTO project_tasks (project_id, title)
            VALUES ($1, $2)
            RETURNING id, project_id, title, completed`,
            [projectId,title]
        );

        return result.rows[0];

      }
}