export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export type NewTask = Pick<Task, "title" | "completed">;