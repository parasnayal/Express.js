export interface Project {
  id: number;
  name: string;
}

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  completed: boolean;
}
