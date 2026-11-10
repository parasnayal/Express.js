export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface CreateTaskInput {
  title: string;
}

export interface ReplaceTaskInput {
  title: string;
  completed: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  completed?: boolean;
}
