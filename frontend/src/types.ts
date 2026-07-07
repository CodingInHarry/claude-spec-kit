export type Role = "PM" | "Engineer";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: User[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];
